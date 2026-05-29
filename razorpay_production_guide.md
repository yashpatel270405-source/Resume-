# Razorpay Production Security Integration Guide
### ResuBuild Premium Subscription System

This guide outlines the complete secure production architecture for **ResuBuild Premium subscriptions**. 

Because client-side Single-Page Applications (SPAs) are inherently exposed to browser manipulation, **never trust subscription state updates done purely in client code** for production deployments. Follow these steps to secure payment verification.

---

## 1. Secure DB Subscription Schema

Create a secure `subscriptions` table inside your Supabase PostgreSQL database. This ensures user status is backed by database records that cannot be forged.

```sql
-- Create subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  is_premium boolean default false not null,
  premium_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.subscriptions enable row level security;

-- Policies: Users can only READ their own subscription
create policy "Users can view own subscription" 
  on public.subscriptions for select 
  using (auth.uid() = user_id);
```

---

## 2. Server-Side Payment Verification (HMAC SHA256)

When a customer pays, Razorpay returns a `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`. You **must** verify this signature on a secure backend before updating the user profile.

### Create a Supabase Edge Function: `verify-payment`

Run in your terminal to create the Edge Function:
```bash
supabase functions new verify-payment
```

Implement the verification logic inside `supabase/functions/verify-payment/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { HmacSHA256 } from "https://esm.sh/crypto-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, payment_id, signature } = await req.json();
    
    // 1. Get secrets from Supabase Edge environment variables
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpaySecret) {
      throw new Error("Razorpay secret key is not configured on the server.");
    }

    // 2. Re-compute payment signature using HMAC SHA256
    const text = order_id + "|" + payment_id;
    const generatedSignature = HmacSHA256(text, razorpaySecret).toString();

    // 3. Compare signatures strictly
    if (generatedSignature !== signature) {
      return new Response(JSON.stringify({ error: "Payment signature mismatch. Transaction is invalid." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4. Initialize Admin Supabase Client to bypass RLS and securely write database updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? "",
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    );

    // Get Auth user from Request Authorization Header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) throw new Error("Unauthorized user request.");

    const premiumUntilDate = new Date();
    premiumUntilDate.setDate(premiumUntilDate.getDate() + 30); // 30-day billing cycle

    // 5. Update user database profiles table
    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        razorpay_order_id: order_id,
        razorpay_payment_id: payment_id,
        is_premium: true,
        premium_until: premiumUntilDate.toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    // 6. Sync metadata directly into Supabase Auth profile for client ease-of-use
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        is_premium: true,
        premium_until: premiumUntilDate.toISOString()
      }
    });

    return new Response(JSON.stringify({ success: true, message: "Subscription activated!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
```

---

## 3. Client-Side Payment Verification Flow (SPA Integration)

In your client application, modify the `handler` callback inside your `Razorpay` configuration to call your secure Edge Function instead of updating metadata locally:

```javascript
        "handler": async function (response) {
          console.log("[Razorpay Success] Verifying signature securely on backend...");
          
          try {
            // Get active session token to authorize Deno Edge Function
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session ? session.access_token : '';
            
            const verifyResponse = await fetch('https://wvllzogrrhbgeoxjmobi.supabase.co/functions/v1/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });
            
            const result = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(result.error || "Payment verification failed.");
            
            alert("👑 Premium Activated! Subscription securely verified on backend.");
            closePricingModal();
            await syncAuthUI();
            
          } catch (err) {
            console.error("Verification failed:", err);
            alert("Security verification failed: " + err.message);
          }
        }
```

This ensures a complete, robust, and highly secure environment for processing production payments!
