-- ============================================================================
-- MaternalSupportCo Hub — Supabase Database Migration
-- Version: 1.0.0 (V1 SaaS)
-- Description: Complete schema for Doula practice workspace with Row-Level Security
--              and zero-friction client token access via SECURITY DEFINER RPCs.
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create tables

-- 2.1 DOULAS table (profiles linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.doulas (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    business_name TEXT NOT NULL DEFAULT 'My Doula Practice',
    plan_tier TEXT NOT NULL DEFAULT 'starter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 CLIENTS table (managed by doula, accessed by client via unique access_token)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doula_id UUID NOT NULL REFERENCES public.doulas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'completed')),
    notes TEXT DEFAULT '',
    access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 DOCUMENTS table (fillable documents: intake, service agreement, birth plan)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    template_type TEXT NOT NULL CHECK (template_type IN ('intake', 'service_agreement', 'birth_plan', 'other')),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'filled', 'signed')),
    file_url TEXT,
    filled_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    signed_name TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 BOOKINGS table (appointment slots and confirmed client visits)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doula_id UUID NOT NULL REFERENCES public.doulas(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    slot_time TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('prenatal', 'labor', 'postpartum')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 INVOICES table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
    payment_method TEXT,
    payment_link TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.6 BILLING_TRACKER table (Medicaid / Private / Self-pay claims tracking)
CREATE TABLE IF NOT EXISTS public.billing_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    payer_type TEXT NOT NULL DEFAULT 'self_pay' CHECK (payer_type IN ('medicaid', 'private', 'self_pay')),
    claim_status TEXT NOT NULL DEFAULT 'not_billed' CHECK (claim_status IN ('not_billed', 'submitted', 'pending', 'paid', 'denied')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_clients_doula_id ON public.clients(doula_id);
CREATE INDEX IF NOT EXISTS idx_clients_access_token ON public.clients(access_token);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_doula_id ON public.bookings(doula_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_tracker_client_id ON public.billing_tracker(client_id);

-- 4. Automatic Doula Profile creation trigger on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_doula_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.doulas (id, email, business_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'business_name', 'My Doula Practice')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_doula_user();

-- 5. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.doulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_tracker ENABLE ROW LEVEL SECURITY;

-- 5.1 DOULAS policies
CREATE POLICY "Doulas can view own profile"
    ON public.doulas FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Doulas can update own profile"
    ON public.doulas FOR UPDATE
    USING (auth.uid() = id);

-- 5.2 CLIENTS policies
CREATE POLICY "Doulas can view own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = doula_id);

CREATE POLICY "Doulas can insert own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = doula_id);

CREATE POLICY "Doulas can update own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = doula_id);

CREATE POLICY "Doulas can delete own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = doula_id);

-- 5.3 DOCUMENTS policies
CREATE POLICY "Doulas can view documents of their clients"
    ON public.documents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = documents.client_id
          AND clients.doula_id = auth.uid()
    ));

CREATE POLICY "Doulas can insert documents for their clients"
    ON public.documents FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = documents.client_id
          AND clients.doula_id = auth.uid()
    ));

CREATE POLICY "Doulas can update documents of their clients"
    ON public.documents FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = documents.client_id
          AND clients.doula_id = auth.uid()
    ));

CREATE POLICY "Doulas can delete documents of their clients"
    ON public.documents FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = documents.client_id
          AND clients.doula_id = auth.uid()
    ));

-- 5.4 BOOKINGS policies
CREATE POLICY "Doulas can view own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = doula_id);

CREATE POLICY "Doulas can insert own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = doula_id);

CREATE POLICY "Doulas can update own bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = doula_id);

CREATE POLICY "Doulas can delete own bookings"
    ON public.bookings FOR DELETE
    USING (auth.uid() = doula_id);

-- 5.5 INVOICES policies
CREATE POLICY "Doulas can view invoices of their clients"
    ON public.invoices FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = invoices.client_id
          AND clients.doula_id = auth.uid()
    ));

CREATE POLICY "Doulas can manage invoices of their clients"
    ON public.invoices FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = invoices.client_id
          AND clients.doula_id = auth.uid()
    ));

-- 5.6 BILLING_TRACKER policies
CREATE POLICY "Doulas can view billing records of their clients"
    ON public.billing_tracker FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = billing_tracker.client_id
          AND clients.doula_id = auth.uid()
    ));

CREATE POLICY "Doulas can manage billing records of their clients"
    ON public.billing_tracker FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = billing_tracker.client_id
          AND clients.doula_id = auth.uid()
    ));


-- ============================================================================
-- 6. RPC Functions for Magic-Link / Token-Based Client Access
--    These functions run as SECURITY DEFINER so anonymous clients can securely
--    interact with ONLY their own records without an auth user account.
-- ============================================================================

-- 6.1 Get Client Portal Data by Access Token (Hardened Search Path)
CREATE OR REPLACE FUNCTION public.get_client_portal(p_token TEXT)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_client RECORD;
    v_doula RECORD;
    v_docs JSONB;
    v_bookings JSONB;
    v_invoices JSONB;
BEGIN
    -- Verify client by token
    SELECT * INTO v_client
    FROM public.clients
    WHERE access_token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid portal token';
    END IF;

    -- Fetch doula info
    SELECT id, business_name, email INTO v_doula
    FROM public.doulas
    WHERE id = v_client.doula_id;

    -- Fetch client documents
    SELECT COALESCE(jsonb_agg(d ORDER BY d.created_at ASC), '[]'::jsonb) INTO v_docs
    FROM (
        SELECT id, template_type, status, file_url, filled_data, signed_name, signed_at, created_at, updated_at
        FROM public.documents
        WHERE client_id = v_client.id
    ) d;

    -- Fetch upcoming client visits / bookings
    SELECT COALESCE(jsonb_agg(b ORDER BY b.slot_time ASC), '[]'::jsonb) INTO v_bookings
    FROM (
        SELECT id, slot_time, type, status, notes
        FROM public.bookings
        WHERE client_id = v_client.id OR (client_id IS NULL AND doula_id = v_client.doula_id AND slot_time >= now())
    ) b;

    -- Fetch client invoices
    SELECT COALESCE(jsonb_agg(i ORDER BY i.created_at DESC), '[]'::jsonb) INTO v_invoices
    FROM (
        SELECT id, amount, description, status, payment_link, paid_at, created_at
        FROM public.invoices
        WHERE client_id = v_client.id
    ) i;

    RETURN jsonb_build_object(
        'client', jsonb_build_object(
            'id', v_client.id,
            'name', v_client.name,
            'email', v_client.email,
            'phone', v_client.phone,
            'due_date', v_client.due_date,
            'status', v_client.status
        ),
        'doula', jsonb_build_object(
            'id', v_doula.id,
            'business_name', v_doula.business_name,
            'email', v_doula.email
        ),
        'documents', v_docs,
        'bookings', v_bookings,
        'invoices', v_invoices
    );
END;
$$;

-- 6.2 Submit Client Document (Hardened Search Path)
CREATE OR REPLACE FUNCTION public.submit_client_doc(
    p_token TEXT,
    p_doc_id UUID,
    p_filled_data JSONB,
    p_signed_name TEXT DEFAULT NULL,
    p_file_url TEXT DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_client_id UUID;
    v_new_status TEXT;
BEGIN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE access_token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid portal token';
    END IF;

    -- If a typed name was provided, mark as signed, otherwise filled
    IF p_signed_name IS NOT NULL AND length(trim(p_signed_name)) > 0 THEN
        v_new_status := 'signed';
    ELSE
        v_new_status := 'filled';
    END IF;

    UPDATE public.documents
    SET
        filled_data = p_filled_data,
        status = v_new_status,
        signed_name = COALESCE(p_signed_name, signed_name),
        signed_at = CASE WHEN p_signed_name IS NOT NULL THEN timezone('utc'::text, now()) ELSE signed_at END,
        file_url = COALESCE(p_file_url, file_url),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_doc_id
      AND client_id = v_client_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document not found or does not belong to client';
    END IF;

    RETURN jsonb_build_object('success', true, 'status', v_new_status);
END;
$$;

-- 6.3 Book an Appointment Slot as Client (Hardened Search Path)
CREATE OR REPLACE FUNCTION public.book_client_slot(
    p_token TEXT,
    p_slot_time TIMESTAMPTZ,
    p_type TEXT,
    p_notes TEXT DEFAULT ''
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_client RECORD;
    v_booking_id UUID;
BEGIN
    SELECT * INTO v_client
    FROM public.clients
    WHERE access_token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid portal token';
    END IF;

    INSERT INTO public.bookings (doula_id, client_id, slot_time, type, status, notes)
    VALUES (v_client.doula_id, v_client.id, p_slot_time, p_type, 'confirmed', p_notes)
    RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'slot_time', p_slot_time,
        'client_name', v_client.name
    );
END;
$$;

-- 7. Storage Bucket Security for Protected Medical Health Information (PHI):
-- In Supabase Storage Settings:
-- 1. Create a PRIVATE bucket named "doula-documents" (public = false).
-- 2. Restrict direct public access; only authenticated doulas and token-verified clients
--    can download documents via signed URLs with short 5-minute expiry (createSignedUrl).

