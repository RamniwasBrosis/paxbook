--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: AdminStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."AdminStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."AdminStatus" OWNER TO paxbook;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."BookingStatus" OWNER TO paxbook;

--
-- Name: CancellationRequestStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."CancellationRequestStatus" AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."CancellationRequestStatus" OWNER TO paxbook;

--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."ContentStatus" OWNER TO paxbook;

--
-- Name: CustomerStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."CustomerStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."CustomerStatus" OWNER TO paxbook;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."DiscountType" AS ENUM (
    'FIXED',
    'PERCENT'
);


ALTER TYPE public."DiscountType" OWNER TO paxbook;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CONVERTED',
    'LOST'
);


ALTER TYPE public."LeadStatus" OWNER TO paxbook;

--
-- Name: PackageStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."PackageStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."PackageStatus" OWNER TO paxbook;

--
-- Name: PageStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."PageStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."PageStatus" OWNER TO paxbook;

--
-- Name: PaymentRecordStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."PaymentRecordStatus" AS ENUM (
    'CREATED',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentRecordStatus" OWNER TO paxbook;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO paxbook;

--
-- Name: PriceModifierType; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."PriceModifierType" AS ENUM (
    'FIXED',
    'PERCENT'
);


ALTER TYPE public."PriceModifierType" OWNER TO paxbook;

--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'REQUESTED',
    'APPROVED',
    'PROCESSED',
    'REJECTED'
);


ALTER TYPE public."RefundStatus" OWNER TO paxbook;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ReviewStatus" OWNER TO paxbook;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO paxbook;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."TaskPriority" OWNER TO paxbook;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'DONE'
);


ALTER TYPE public."TaskStatus" OWNER TO paxbook;

--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."TenantStatus" AS ENUM (
    'ACTIVE',
    'TRIAL',
    'SUSPENDED'
);


ALTER TYPE public."TenantStatus" OWNER TO paxbook;

--
-- Name: VendorCategoryType; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."VendorCategoryType" AS ENUM (
    'HOTEL',
    'TRANSPORT',
    'GUIDE',
    'ACTIVITY'
);


ALTER TYPE public."VendorCategoryType" OWNER TO paxbook;

--
-- Name: VendorPaymentStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."VendorPaymentStatus" AS ENUM (
    'PENDING',
    'PAID'
);


ALTER TYPE public."VendorPaymentStatus" OWNER TO paxbook;

--
-- Name: VendorStatus; Type: TYPE; Schema: public; Owner: paxbook
--

CREATE TYPE public."VendorStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."VendorStatus" OWNER TO paxbook;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO paxbook;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text NOT NULL,
    phone text,
    status public."AdminStatus" DEFAULT 'ACTIVE'::public."AdminStatus" NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isPlatformOwner" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.admin_users OWNER TO paxbook;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "actorAdminId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "diffJson" jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO paxbook;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.banners (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "imageKey" text NOT NULL,
    "linkUrl" text,
    placement text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "activeFrom" timestamp(3) without time zone,
    "activeTo" timestamp(3) without time zone
);


ALTER TABLE public.banners OWNER TO paxbook;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    body text NOT NULL,
    "coverImageKey" text,
    "authorId" text,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text,
    excerpt text,
    "readMinutes" integer
);


ALTER TABLE public.blog_posts OWNER TO paxbook;

--
-- Name: booking_status_history; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.booking_status_history (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "fromStatus" public."BookingStatus",
    "toStatus" public."BookingStatus" NOT NULL,
    "changedByAdminId" text,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text
);


ALTER TABLE public.booking_status_history OWNER TO paxbook;

--
-- Name: booking_travelers; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.booking_travelers (
    "bookingId" text NOT NULL,
    "travelerId" text NOT NULL
);


ALTER TABLE public.booking_travelers OWNER TO paxbook;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.bookings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text NOT NULL,
    "packageId" text NOT NULL,
    "consultantId" text,
    status public."BookingStatus" DEFAULT 'DRAFT'::public."BookingStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "travelStartDate" timestamp(3) without time zone,
    "travelEndDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bookings OWNER TO paxbook;

--
-- Name: cancellation_requests; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.cancellation_requests (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "customerId" text NOT NULL,
    reason text,
    status public."CancellationRequestStatus" DEFAULT 'REQUESTED'::public."CancellationRequestStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolutionNote" text
);


ALTER TABLE public.cancellation_requests OWNER TO paxbook;

--
-- Name: consultants; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.consultants (
    id text NOT NULL,
    "adminUserId" text NOT NULL,
    "targetRevenue" numeric(12,2),
    "activeLeadCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.consultants OWNER TO paxbook;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.countries (
    id text NOT NULL,
    name text NOT NULL,
    iso2 text NOT NULL,
    region text
);


ALTER TABLE public.countries OWNER TO paxbook;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" public."DiscountType" NOT NULL,
    value numeric(12,2) NOT NULL,
    "minBookingAmount" numeric(12,2),
    "maxDiscountAmount" numeric(12,2),
    "destinationId" text,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validTo" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coupons OWNER TO paxbook;

--
-- Name: customer_documents; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.customer_documents (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "travelerId" text,
    "docType" text NOT NULL,
    "storageKey" text NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_documents OWNER TO paxbook;

--
-- Name: customer_refresh_tokens; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.customer_refresh_tokens (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "replacedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_refresh_tokens OWNER TO paxbook;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.customers (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "passwordHash" text,
    "phoneVerifiedAt" timestamp(3) without time zone,
    status public."CustomerStatus" DEFAULT 'ACTIVE'::public."CustomerStatus" NOT NULL
);


ALTER TABLE public.customers OWNER TO paxbook;

--
-- Name: destination_activities; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destination_activities (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    label text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.destination_activities OWNER TO paxbook;

--
-- Name: destination_categories; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destination_categories (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.destination_categories OWNER TO paxbook;

--
-- Name: destination_category_map; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destination_category_map (
    "destinationId" text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public.destination_category_map OWNER TO paxbook;

--
-- Name: destination_highlights; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destination_highlights (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.destination_highlights OWNER TO paxbook;

--
-- Name: destination_hotel_suggestions; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destination_hotel_suggestions (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    name text,
    "starRating" integer NOT NULL,
    area text NOT NULL,
    descriptor text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.destination_hotel_suggestions OWNER TO paxbook;

--
-- Name: destinations; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.destinations (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "countryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "heroImageKey" text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bestTimeToVisit" text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.destinations OWNER TO paxbook;

--
-- Name: emi_plans; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.emi_plans (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "totalInstallments" integer NOT NULL,
    schedule jsonb NOT NULL
);


ALTER TABLE public.emi_plans OWNER TO paxbook;

--
-- Name: faq_items; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.faq_items (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "entityType" text,
    "entityId" text,
    question text NOT NULL,
    answer text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.faq_items OWNER TO paxbook;

--
-- Name: homepage_blocks; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.homepage_blocks (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type text NOT NULL,
    "configJson" jsonb NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.homepage_blocks OWNER TO paxbook;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "bookingId" text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "storageKey" text,
    amount numeric(12,2) NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoices OWNER TO paxbook;

--
-- Name: itinerary_days; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.itinerary_days (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "dayNumber" integer NOT NULL,
    title text NOT NULL,
    description text
);


ALTER TABLE public.itinerary_days OWNER TO paxbook;

--
-- Name: lead_follow_ups; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.lead_follow_ups (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    notes text,
    method text
);


ALTER TABLE public.lead_follow_ups OWNER TO paxbook;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.leads (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text,
    name text NOT NULL,
    email text,
    phone text,
    source text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "assignedConsultantId" text,
    "destinationInterest" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.leads OWNER TO paxbook;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO paxbook;

--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.otp_codes (
    id text NOT NULL,
    "subjectType" text NOT NULL,
    "subjectId" text NOT NULL,
    channel text NOT NULL,
    "codeHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.otp_codes OWNER TO paxbook;

--
-- Name: package_activities; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_activities (
    id text NOT NULL,
    "itineraryDayId" text NOT NULL,
    "activityVendorId" text,
    name text NOT NULL,
    description text,
    "isOptional" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.package_activities OWNER TO paxbook;

--
-- Name: package_flights; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_flights (
    id text NOT NULL,
    "packageId" text NOT NULL,
    sector text NOT NULL,
    "carrierName" text,
    "isIncluded" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.package_flights OWNER TO paxbook;

--
-- Name: package_gallery_images; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_gallery_images (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "storageKey" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.package_gallery_images OWNER TO paxbook;

--
-- Name: package_hotels; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_hotels (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "cityName" text NOT NULL,
    "hotelVendorId" text,
    "roomType" text,
    "mealPlan" text,
    "checkInDay" integer NOT NULL,
    "checkOutDay" integer NOT NULL
);


ALTER TABLE public.package_hotels OWNER TO paxbook;

--
-- Name: package_pricing_tiers; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_pricing_tiers (
    id text NOT NULL,
    "packageId" text NOT NULL,
    name text NOT NULL,
    "basePrice" numeric(12,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL
);


ALTER TABLE public.package_pricing_tiers OWNER TO paxbook;

--
-- Name: package_route_map_points; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.package_route_map_points (
    id text NOT NULL,
    "packageId" text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    label text
);


ALTER TABLE public.package_route_map_points OWNER TO paxbook;

--
-- Name: packages; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.packages (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "destinationId" text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "durationDays" integer NOT NULL,
    "durationNights" integer NOT NULL,
    "basePrice" numeric(12,2) NOT NULL,
    status public."PackageStatus" DEFAULT 'DRAFT'::public."PackageStatus" NOT NULL,
    "templateHintSlug" text,
    "deletedAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    inclusions text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.packages OWNER TO paxbook;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.pages (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    status public."PageStatus" DEFAULT 'DRAFT'::public."PageStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pages OWNER TO paxbook;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "bookingId" text NOT NULL,
    provider text DEFAULT 'razorpay'::text NOT NULL,
    "providerRef" text,
    amount numeric(12,2) NOT NULL,
    status public."PaymentRecordStatus" DEFAULT 'CREATED'::public."PaymentRecordStatus" NOT NULL,
    method text,
    "capturedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO paxbook;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    key text NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO paxbook;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.plans (
    id text NOT NULL,
    name text NOT NULL,
    "priceMonthly" numeric(10,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "maxAdminUsers" integer,
    "maxPackages" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "razorpayPlanId" text
);


ALTER TABLE public.plans OWNER TO paxbook;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    "adminUserId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "replacedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO paxbook;

--
-- Name: refund_requests; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.refund_requests (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text,
    status public."RefundStatus" DEFAULT 'REQUESTED'::public."RefundStatus" NOT NULL,
    "processedAt" timestamp(3) without time zone
);


ALTER TABLE public.refund_requests OWNER TO paxbook;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "packageId" text NOT NULL,
    "customerId" text,
    "authorName" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reviews OWNER TO paxbook;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.role_permissions (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO paxbook;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.roles (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.roles OWNER TO paxbook;

--
-- Name: seasonal_rates; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.seasonal_rates (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "priceModifierType" public."PriceModifierType" NOT NULL,
    value numeric(12,2) NOT NULL
);


ALTER TABLE public.seasonal_rates OWNER TO paxbook;

--
-- Name: seo_meta; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.seo_meta (
    id text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    title text,
    description text,
    "ogImageKey" text,
    "canonicalUrl" text,
    "schemaJson" jsonb
);


ALTER TABLE public.seo_meta OWNER TO paxbook;

--
-- Name: sitemap_entries; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.sitemap_entries (
    id text NOT NULL,
    url text NOT NULL,
    "lastModified" timestamp(3) without time zone NOT NULL,
    priority double precision DEFAULT 0.5 NOT NULL
);


ALTER TABLE public.sitemap_entries OWNER TO paxbook;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "planId" text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'TRIALING'::public."SubscriptionStatus" NOT NULL,
    "razorpaySubscriptionId" text,
    "currentPeriodEnd" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO paxbook;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "assignedToId" text NOT NULL,
    "relatedEntityType" text,
    "relatedEntityId" text,
    title text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    status public."TaskStatus" DEFAULT 'OPEN'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL
);


ALTER TABLE public.tasks OWNER TO paxbook;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customDomain" text,
    "logoStorageKey" text,
    "primaryColor" text,
    "templateSlug" text DEFAULT 'classic'::text NOT NULL,
    status public."TenantStatus" DEFAULT 'ACTIVE'::public."TenantStatus" NOT NULL,
    "razorpayKeyId" text,
    "razorpayKeySecretEncrypted" text,
    "twilioAccountSid" text,
    "twilioAuthTokenEncrypted" text,
    "twilioFromNumber" text,
    "twilioWhatsappFromNumber" text,
    "facebookPixelId" text,
    "ga4MeasurementId" text,
    "googleClientId" text,
    "googleClientSecretEncrypted" text,
    "googleMapsApiKey" text,
    "s3AccessKeyId" text,
    "s3Bucket" text,
    "s3PublicBaseUrl" text,
    "s3Region" text,
    "s3SecretAccessKeyEncrypted" text,
    "smtpFromEmail" text,
    "smtpHost" text,
    "smtpPasswordEncrypted" text,
    "smtpPort" integer,
    "smtpUser" text
);


ALTER TABLE public.tenants OWNER TO paxbook;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "customerName" text NOT NULL,
    rating integer NOT NULL,
    content text NOT NULL,
    "imageKey" text,
    "isFeatured" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.testimonials OWNER TO paxbook;

--
-- Name: travelers; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.travelers (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    dob timestamp(3) without time zone,
    "passportNumber" text,
    nationality text
);


ALTER TABLE public.travelers OWNER TO paxbook;

--
-- Name: vendor_contracts; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.vendor_contracts (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    terms text,
    "commissionRate" numeric(5,2),
    "storageKey" text
);


ALTER TABLE public.vendor_contracts OWNER TO paxbook;

--
-- Name: vendor_payments; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.vendor_payments (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    "bookingId" text,
    amount numeric(12,2) NOT NULL,
    status public."VendorPaymentStatus" DEFAULT 'PENDING'::public."VendorPaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone
);


ALTER TABLE public.vendor_payments OWNER TO paxbook;

--
-- Name: vendor_refresh_tokens; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.vendor_refresh_tokens (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "replacedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vendor_refresh_tokens OWNER TO paxbook;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "categoryType" public."VendorCategoryType" NOT NULL,
    "contactInfo" text,
    status public."VendorStatus" DEFAULT 'ACTIVE'::public."VendorStatus" NOT NULL,
    email text,
    "passwordHash" text
);


ALTER TABLE public.vendors OWNER TO paxbook;

--
-- Name: visa_info; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.visa_info (
    id text NOT NULL,
    "countryId" text NOT NULL,
    "visaType" text NOT NULL,
    "processingTime" text NOT NULL,
    "visaFee" numeric(10,2),
    currency text DEFAULT 'INR'::text NOT NULL,
    notes text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isVisaFree" boolean DEFAULT false NOT NULL,
    "requiredDocuments" text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.visa_info OWNER TO paxbook;

--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.vouchers (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "storageKey" text NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vouchers OWNER TO paxbook;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: paxbook
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "customerId" text NOT NULL,
    "packageId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO paxbook;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4e22f871-d9e0-44b4-a000-bdfbf5d17d3e	6a162e29f02d4bc15cdac61785f96b6679d11f3021da16b80c8d5661f96c1175	2026-08-08 14:18:10.281783+05:30	20260808084809_init	\N	\N	2026-08-08 14:18:09.442765+05:30	1
39e6ea1e-9f9d-4202-a636-b5df8a0e857d	847f4f70ec08e319b7da51eca814751e2962fb60a12282707bbd223d5af10bb2	2026-08-11 12:25:09.416407+05:30	20260811065509_add_reviews_offers_visa_pages	\N	\N	2026-08-11 12:25:09.258746+05:30	1
89a65166-dca1-4d01-8569-a541ba35d079	17975a03c45fbaf59c73d20466db906afc2f769749ec6d8c5210b508a67210c8	2026-08-11 17:13:57.721889+05:30	20260811114343_add_customer_auth_and_dashboard	\N	\N	2026-08-11 17:13:57.484873+05:30	1
e47889f8-07ca-4db8-99e2-6391be47f2aa	4ac1bdaab0c15ffba14cca1fdaffe634cdf3e846d06d9bad9487205a7eb3df90	2026-08-11 18:03:48.52928+05:30	20260811123344_add_vendor_portal	\N	\N	2026-08-11 18:03:48.455218+05:30	1
909cf6e7-4cde-4da7-be27-5c16d9ca6931	b6d3e2389e1cae653f28b592890b6f3bfaa97735e651a6a60fb7db6128af2f8d	2026-08-12 10:32:11.487268+05:30	20260812050206_add_platform_saas	\N	\N	2026-08-12 10:32:11.313065+05:30	1
ddffe62c-692a-4584-8b0b-b109de7493b8	cd31890e3fd5a4d51962865871224c99f8c7eafba9b12521b70517284a6c8de0	2026-08-12 10:41:17.227851+05:30	20260812051112_add_plan_razorpay_id	\N	\N	2026-08-12 10:41:17.175494+05:30	1
ee2e68ae-ad02-4ca3-8926-3630455529c3	c6b0708644ab292aa8adc5ffef47df3900fb32daaf5e7de13a4ec80cf7038225	2026-08-14 12:57:12.425818+05:30	20260814125708_tenant_integration_credentials	\N	\N	2026-08-14 12:57:12.373271+05:30	1
ddc2d0b0-339d-420d-a84b-f715c8ae2e38	dde52aa52cdaad939da7cde243bfc4e8024657f115bb83befa72465e8de35e5a	2026-08-20 10:46:31.488224+05:30	20260820102018_destination_isactive_content_and_richer_cms	\N	\N	2026-08-20 10:46:31.124594+05:30	1
2d3cc991-0aba-4ef5-8bda-44814235ad7e	8723ab75d2ea69ff495cc7ca59365ad7d66f27b53aec87a4604814412c89130b	2026-08-21 16:40:56.419171+05:30	20260821111056_tenant_integration_expansion	\N	\N	2026-08-21 16:40:56.361411+05:30	1
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.admin_users (id, "tenantId", email, "passwordHash", name, phone, status, "roleId", "createdAt", "updatedAt", "isPlatformOwner") FROM stdin;
dce14043-f6ae-4c09-9154-2c79b3025d30	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	editor@paxbook.test	$argon2id$v=19$m=65536,t=3,p=4$9r1nq45fWrr9gIgH2OUTMg$PyiOVi0GfbppbHFJQtxwxULUDWblcSiUHcwTozsd4Ec	Sample Content Editor	\N	ACTIVE	56375575-af71-4bfe-b36e-e3d26d8e6975	2026-08-08 08:48:59.753	2026-08-08 08:48:59.753	f
8e56298c-efe9-4d5c-b6a5-9458f4e3de09	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	test.consultant@paxbook.test	$argon2id$v=19$m=65536,t=3,p=4$bOvqNC3MRIB1xvkY1zoTmg$AxU84Pwfx44you8zANmoF7Yu2ggbwTj90FybvY0g8xQ	Test Consultant	\N	ACTIVE	e2d34b11-9f5a-49c2-91d0-99d06fe8de17	2026-08-08 09:15:20.492	2026-08-08 09:15:20.492	f
d2a80f53-ba84-46ef-83ff-d315cc280751	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	ops.test@paxbook.test	$argon2id$v=19$m=65536,t=3,p=4$53yBt5RPY/JfoDMRivMx9Q$pdRzUrdWvAI0M07REzbk+V9ids6/2XjtYU9JMCafOng	Ops Tester	\N	ACTIVE	a5d1021e-1539-48e6-8c67-68e7c22f9b7a	2026-08-08 09:27:29.9	2026-08-08 09:27:29.9	f
75b0ad19-2a3d-468a-b4d8-5b064868b3da	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	asha@wanderlust.test	$argon2id$v=19$m=65536,t=3,p=4$mAuypwuiV2WtUz0Z68ELEw$RHxk+H+7/M15r67lfYRO4BBJGybCYLMdeLMjgzCy+kk	Asha Rao	\N	ACTIVE	eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	2026-08-12 06:15:23.364	2026-08-12 06:15:23.364	f
20b6c891-02d1-43ab-9ee4-65372be811b2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	admin@paxbook.test	$argon2id$v=19$m=65536,t=3,p=4$nyuWRZd/JGjbrjhjDxT5wA$URUjfeN6OnewsYSXPbcsTTeZBsN/2m+ZwRiey4xwJPs	Paxbook Super Admin	\N	ACTIVE	db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	2026-08-08 08:48:59.643	2026-08-20 05:47:44.17	t
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.audit_logs (id, "tenantId", "actorAdminId", action, "entityType", "entityId", "diffJson", "ipAddress", "createdAt") FROM stdin;
289e5cdb-4ea7-4192-9819-d6e263a52112	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/users	v1	8e56298c-efe9-4d5c-b6a5-9458f4e3de09	{"requestBody": {"name": "Test Consultant", "email": "test.consultant@paxbook.test", "roleId": "e2d34b11-9f5a-49c2-91d0-99d06fe8de17", "password": "TestPass@123"}}	::1	2026-08-08 09:15:20.506
84172a22-4b39-4500-bcde-377b6c78ef36	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/users	users	d2a80f53-ba84-46ef-83ff-d315cc280751	{"requestBody": {"name": "Ops Tester", "email": "ops.test@paxbook.test", "roleId": "a5d1021e-1539-48e6-8c67-68e7c22f9b7a", "password": "[REDACTED]"}}	::1	2026-08-08 09:27:29.909
cfc22a9d-70bf-4d14-bc75-51840ee3412f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	bdd09d56-d5b9-4934-81f4-66ca7c90a58c	{"requestBody": {"name": "Phuket", "slug": "phuket", "countryId": "fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995", "isFeatured": true, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537"], "description": "Beaches and islands"}}	::1	2026-08-11 06:16:14.6
4236878a-6771-4edf-b887-f624a89633aa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {"slug": "phuket-honeymoon-escape", "title": "Phuket Honeymoon Escape", "hotels": [{"cityName": "Phuket", "mealPlan": "Breakfast", "roomType": "Deluxe", "checkInDay": 1, "checkOutDay": 4}], "status": "PUBLISHED", "flights": [{"sector": "DEL-HKT", "isIncluded": true, "carrierName": "IndiGo"}], "basePrice": 45000, "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 45000}], "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c", "galleryImages": [], "itineraryDays": [{"title": "Arrival", "dayNumber": 1, "activities": [{"name": "Beach walk", "isOptional": false}], "description": "Airport pickup and check-in"}, {"title": "Island hopping", "dayNumber": 2, "activities": [{"name": "Snorkeling", "isOptional": true}], "description": "Phi Phi islands tour"}], "seasonalRates": [{"value": 15, "endDate": "2027-01-05", "startDate": "2026-12-20", "priceModifierType": "PERCENT"}], "durationNights": 3, "routeMapPoints": [{"lat": 7.8804, "lng": 98.3923, "label": "Patong Beach"}]}}	::1	2026-08-11 06:16:55.854
06b8090f-0e06-4915-92e9-a2d66cfe434b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	8c6c9a40-4931-4205-92e2-d09ff136b71e	{"requestBody": {"answer": "No, visa is separate.", "question": "Is visa included?", "sortOrder": 0}}	::1	2026-08-11 06:17:45.766
42b980b2-8b41-4eb8-971d-1a57c61df89a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-11 06:21:42.279
d2396722-0183-48dd-8095-08f931fbd5e3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-11 06:21:42.426
69608ace-a8e7-4cd2-88b1-e5750d87c3c7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb/unpublish	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {}}	::1	2026-08-11 06:23:11.175
68d8ecfa-ce31-451d-a2f8-eb8696b84bdb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb/publish	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {}}	::1	2026-08-11 06:23:11.531
f805e113-cc78-47f5-bee0-ccb6b8727cb4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {"slug": "phuket-honeymoon-escape", "title": "Phuket Honeymoon Escape (Updated)", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 52000, "durationDays": 5, "pricingTiers": [], "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c", "galleryImages": [], "itineraryDays": [{"title": "Arrival day", "dayNumber": 1, "activities": []}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-11 06:23:21.622
95052ea0-3ed5-4168-8c81-6b68d6d93aab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/reviews	reviews	2108dca8-9308-42c0-89b1-46b1c03c3a5e	{"requestBody": {"title": "Amazing trip", "rating": 5, "comment": "Loved every moment of it.", "packageId": "60b2a309-7fa5-4c73-9f9e-f0db9189cbcb", "authorName": "Rahul S."}}	::1	2026-08-11 07:33:47.79
de4dc24a-ec43-4124-89ec-54b57ffc49ba	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/reviews/2108dca8-9308-42c0-89b1-46b1c03c3a5e/status	reviews	2108dca8-9308-42c0-89b1-46b1c03c3a5e	{"requestBody": {"status": "APPROVED"}}	::1	2026-08-11 07:33:48.103
1caed304-32cb-4dc2-b0e6-57747c3254fb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/offers	offers	79020ee0-165e-4ed0-b82b-bf244835743c	{"requestBody": {"code": "phuket15", "value": 15, "validTo": "2026-12-31", "validFrom": "2026-08-01", "usageLimit": 100, "discountType": "PERCENT", "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c"}}	::1	2026-08-11 07:33:59.626
b0cf8bff-40ce-4fc9-865f-3d8855f3ac67	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	cms	unknown	{"requestBody": {"visaFee": 2000, "currency": "INR", "visaType": "Visa on Arrival", "processingTime": "On arrival, ~30 min", "requiredDocuments": "Passport, return ticket, hotel booking, 10000 THB cash"}}	::1	2026-08-11 07:33:59.977
a30549ea-4e4b-478f-a357-f1cf7da2c047	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/pages	cms	82a116a3-6d68-4a2a-bc5c-5b7c0f56a296	{"requestBody": {"body": "Paxbook is a travel booking platform.", "slug": "about-us", "title": "About Us", "status": "PUBLISHED"}}	::1	2026-08-11 07:34:00.088
de8c7bce-f49a-4528-b8db-aea2f721e82c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/customers	customers	5515c807-08fe-4d19-b467-c02264cce0f7	{"requestBody": {"name": "Anita Sharma", "email": "anita.sharma@example.com", "phone": "9876543210"}}	::1	2026-08-11 09:34:53.02
d3056825-2551-4134-aa1d-9213a1f3b0b7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/customers/5515c807-08fe-4d19-b467-c02264cce0f7/travelers	customers	1aa4abe6-92ed-44b4-9d01-fea874c79a32	{"requestBody": {"name": "Anita Sharma", "nationality": "Indian", "passportNumber": "P1234567"}}	::1	2026-08-11 09:34:53.355
b5466ff0-c0f2-434e-ae15-cc21ba84d8ac	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/customers/5515c807-08fe-4d19-b467-c02264cce0f7/travelers	customers	8cad87f9-dab8-414b-9045-5bf6d92a1ffb	{"requestBody": {"name": "Rohan Sharma", "nationality": "Indian"}}	::1	2026-08-11 09:34:53.654
99f62947-c5c8-4cc9-b855-62dd294a6da2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-11 09:34:53.936
cfcc9b36-cee5-4718-a59c-69edcfc207f5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/customers/5515c807-08fe-4d19-b467-c02264cce0f7/documents	customers	39a03b9b-1e0a-442f-8f03-a858086e0b0a	{"requestBody": {"docType": "Passport", "storageKey": "5a1d65d3-efdf-4ed7-8bcb-baddb0844f07-pixel.png", "travelerId": "1aa4abe6-92ed-44b4-9d01-fea874c79a32"}}	::1	2026-08-11 09:34:54.261
26f10193-fc8e-4ee3-b50c-14627ce892d8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/bookings	bookings	166c002e-e168-448d-91f9-8f96d5609783	{"requestBody": {"currency": "INR", "packageId": "60b2a309-7fa5-4c73-9f9e-f0db9189cbcb", "customerId": "5515c807-08fe-4d19-b467-c02264cce0f7", "totalAmount": 95000, "travelEndDate": "2026-12-24", "travelStartDate": "2026-12-20"}}	::1	2026-08-11 09:35:13.667
84d2b786-62a0-4602-afa1-b1fbfe7221ba	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/bookings/166c002e-e168-448d-91f9-8f96d5609783/travelers	bookings	166c002e-e168-448d-91f9-8f96d5609783	{"requestBody": {"travelerIds": ["1aa4abe6-92ed-44b4-9d01-fea874c79a32", "8cad87f9-dab8-414b-9045-5bf6d92a1ffb"]}}	::1	2026-08-11 09:35:14.192
908cb9fa-8ab6-433d-a28d-0a55a56360ce	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/bookings/166c002e-e168-448d-91f9-8f96d5609783/status	bookings	166c002e-e168-448d-91f9-8f96d5609783	{"requestBody": {"note": "Payment received in full", "toStatus": "CONFIRMED"}}	::1	2026-08-11 09:35:14.441
d9b87fb5-279c-4bdb-84bd-c64821a92bbc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-11 09:35:14.601
5fbd01c2-37ab-4e78-9e6a-c2d781d1157f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/bookings/166c002e-e168-448d-91f9-8f96d5609783/voucher	bookings	166c002e-e168-448d-91f9-8f96d5609783	{"requestBody": {"storageKey": "fd531503-7ef1-4aa4-845a-28a323e208fc-pixel.png"}}	::1	2026-08-11 09:35:14.993
0fd65144-5757-44e5-9afa-f4420832fd89	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/crm/consultants	crm	cb078059-80e8-4933-8b90-9ceb727e0dd1	{"requestBody": {"adminUserId": "20b6c891-02d1-43ab-9ee4-65372be811b2", "targetRevenue": 500000}}	::1	2026-08-11 09:52:23.518
17dd3c8a-6ad1-49c0-a26b-3741326bd709	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/leads	leads	cfbff2cc-0b6d-4c75-b502-f5c66417e017	{"requestBody": {"name": "Priya Mehta", "email": "priya@example.com", "phone": "9998887771", "source": "Website", "destinationInterest": "Bali", "assignedConsultantId": "20b6c891-02d1-43ab-9ee4-65372be811b2"}}	::1	2026-08-11 09:52:23.692
219ef32c-81c8-4f7e-9b9d-c42972bf7203	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/leads/cfbff2cc-0b6d-4c75-b502-f5c66417e017/follow-ups	leads	ad1d3e06-cfde-44de-808d-c03180477c3e	{"requestBody": {"notes": "Introduce packages", "method": "Call", "scheduledAt": "2026-08-15T10:00:00.000Z"}}	::1	2026-08-11 09:52:38.31
7beb92a8-c259-4508-bf7f-f35b23e0f66b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/leads/cfbff2cc-0b6d-4c75-b502-f5c66417e017/follow-ups	leads	7d4b2bb7-8fec-479b-86f5-9910e33e337e	{"requestBody": {"method": "Email", "scheduledAt": "2026-08-20T10:00:00.000Z"}}	::1	2026-08-11 09:52:38.69
4e680a32-659c-4336-bdd7-6cb997fb7ace	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/leads/cfbff2cc-0b6d-4c75-b502-f5c66417e017/follow-ups/ad1d3e06-cfde-44de-808d-c03180477c3e	leads	ad1d3e06-cfde-44de-808d-c03180477c3e	{"requestBody": {"notes": "Introduce packages", "method": "Call", "completedAt": "2026-08-11T10:00:00.000Z", "scheduledAt": "2026-08-15T10:00:00.000Z"}}	::1	2026-08-11 09:52:38.811
4662e4a8-a0a9-4b00-b912-1caa0a49cde1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/leads/cfbff2cc-0b6d-4c75-b502-f5c66417e017/status	leads	cfbff2cc-0b6d-4c75-b502-f5c66417e017	{"requestBody": {"status": "CONVERTED"}}	::1	2026-08-11 09:52:39.319
f9bf01f1-12f7-44e6-962f-10b355a8a1ab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/crm/tasks	crm	6cda43a8-05e6-434e-b425-2fbfc5134585	{"requestBody": {"title": "Follow up on Bali quote", "dueDate": "2026-08-18", "priority": "HIGH", "assignedToId": "20b6c891-02d1-43ab-9ee4-65372be811b2"}}	::1	2026-08-11 09:52:54.478
972e13a7-3deb-4303-a3c2-b7f6ec400acf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/payments	payments	0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f	{"requestBody": {"amount": 50000, "method": "UPI", "bookingId": "166c002e-e168-448d-91f9-8f96d5609783", "providerRef": "pay_test_001"}}	::1	2026-08-11 10:06:13.756
5b3a617d-db97-4f1b-bcf0-8ae846e6a94d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/payments/0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f/status	payments	0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f	{"requestBody": {"status": "CAPTURED"}}	::1	2026-08-11 10:06:14.281
cf578e28-e249-4503-9754-9813a800b1c4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/payments	payments	381bdd09-997e-46c6-b47d-ed94c80bf3c2	{"requestBody": {"amount": 45000, "method": "Card", "bookingId": "166c002e-e168-448d-91f9-8f96d5609783"}}	::1	2026-08-11 10:06:14.712
d93ac5b3-398d-4369-8833-fa380cdf6a7c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/payments/381bdd09-997e-46c6-b47d-ed94c80bf3c2/status	payments	381bdd09-997e-46c6-b47d-ed94c80bf3c2	{"requestBody": {"status": "CAPTURED"}}	::1	2026-08-11 10:06:15.139
308ec51d-1ee0-4d69-ba15-b48d002c0f2d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/invoices	invoices	25be6018-c712-42c3-a0d4-bc1d876c3a7c	{"requestBody": {"amount": 95000, "bookingId": "166c002e-e168-448d-91f9-8f96d5609783"}}	::1	2026-08-11 10:06:31.017
2975856b-c6ab-4217-8f3d-f1f83efec972	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/invoices	invoices	624638b8-3b53-4aa2-a5e5-8930e351d32c	{"requestBody": {"amount": 1000, "bookingId": "166c002e-e168-448d-91f9-8f96d5609783"}}	::1	2026-08-11 10:06:31.158
51c8f6e0-97ff-470c-ba84-407946ab9c98	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/bookings/166c002e-e168-448d-91f9-8f96d5609783/emi-plan	bookings	6bfd238f-afcd-4e88-9e49-0770bd34b28e	{"requestBody": {"schedule": [{"amount": 31666.67, "dueDate": "2026-09-01"}, {"amount": 31666.67, "dueDate": "2026-10-01"}, {"paid": false, "amount": 31666.66, "dueDate": "2026-11-01"}], "totalInstallments": 3}}	::1	2026-08-11 10:06:31.435
ea012cf0-eb3c-4c32-80c7-7722c5844388	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"heroImageKey": "3384a2fd-e4b9-449f-b5a4-e99326cb90fe-rajasthan.jpg"}}	::1	2026-08-12 07:30:03.26
613c836f-3256-4867-923d-da08d60e5b54	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/refunds	refunds	2cbd2f31-08a8-432f-87b3-91bd7cc8c361	{"requestBody": {"amount": 20000, "reason": "Partial cancellation - one traveler dropped", "bookingId": "166c002e-e168-448d-91f9-8f96d5609783", "paymentId": "0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f"}}	::1	2026-08-11 10:07:06.377
b047749c-f272-4f4d-86ff-0aae4457f5b8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/refunds/2cbd2f31-08a8-432f-87b3-91bd7cc8c361/status	refunds	2cbd2f31-08a8-432f-87b3-91bd7cc8c361	{"requestBody": {"status": "APPROVED"}}	::1	2026-08-11 10:07:06.8
e6c2584a-1cbc-4098-a6e9-98aff4ac7371	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/refunds/2cbd2f31-08a8-432f-87b3-91bd7cc8c361/status	refunds	2cbd2f31-08a8-432f-87b3-91bd7cc8c361	{"requestBody": {"status": "PROCESSED"}}	::1	2026-08-11 10:07:07.172
99398ea5-d0c1-4b21-a645-900f1d011ca0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors	vendors	27436adf-9dfc-486d-ba40-12a04cba9903	{"requestBody": {"name": "Patong Beach Resort", "contactInfo": "reservations@patongbeach.example", "categoryType": "HOTEL"}}	::1	2026-08-11 10:17:15.053
cf3eaec0-bb92-4b19-b3f4-efb223538353	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors	vendors	abb87a3f-29ea-4135-9668-f4c83f080930	{"requestBody": {"name": "Phi Phi Snorkel Tours", "categoryType": "ACTIVITY"}}	::1	2026-08-11 10:17:15.427
e432fd94-1629-4fa2-9d08-e7cbc9715e81	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {"slug": "phuket-honeymoon-escape", "title": "Phuket Honeymoon Escape (Updated)", "hotels": [{"cityName": "Phuket", "checkInDay": 1, "checkOutDay": 5, "hotelVendorId": "27436adf-9dfc-486d-ba40-12a04cba9903"}], "status": "PUBLISHED", "flights": [], "basePrice": 52000, "durationDays": 5, "pricingTiers": [], "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c", "galleryImages": [], "itineraryDays": [{"title": "Arrival day", "dayNumber": 1, "activities": [{"name": "Snorkeling trip", "activityVendorId": "abb87a3f-29ea-4135-9668-f4c83f080930"}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-11 10:17:38.673
02bf24ea-bd2f-4c20-b77f-9fd4bf1d1b4b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-11 10:17:56.478
08492262-18fb-471d-8ce2-b417e9ecac5f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors/27436adf-9dfc-486d-ba40-12a04cba9903/contracts	vendors	0fb49b95-44d6-4195-be5e-be34bcb7c851	{"requestBody": {"terms": "Net rate + 12.5% commission", "endDate": "2026-12-31", "startDate": "2026-01-01", "storageKey": "9cbe2d60-f71d-4946-9eea-fb085469ac8d-pixel.png", "commissionRate": 12.5}}	::1	2026-08-11 10:17:56.844
955fbac6-bcc7-4230-8db6-9d12a1c6521e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendor-payments	vendor-payments	0b2b2f54-c4f9-4b15-a45d-554a5f58ed7e	{"requestBody": {"amount": 28000, "vendorId": "27436adf-9dfc-486d-ba40-12a04cba9903", "bookingId": "166c002e-e168-448d-91f9-8f96d5609783"}}	::1	2026-08-11 10:17:57.007
4846efd2-3185-4cd9-84f6-333bf7737e56	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/vendor-payments/0b2b2f54-c4f9-4b15-a45d-554a5f58ed7e/mark-paid	vendor-payments	0b2b2f54-c4f9-4b15-a45d-554a5f58ed7e	{"requestBody": {}}	::1	2026-08-11 10:17:57.373
9b4627b4-d863-4e7a-85a0-9ae2941d0778	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/bookings/166c002e-e168-448d-91f9-8f96d5609783	bookings	166c002e-e168-448d-91f9-8f96d5609783	{"requestBody": {"currency": "INR", "packageId": "60b2a309-7fa5-4c73-9f9e-f0db9189cbcb", "customerId": "5515c807-08fe-4d19-b467-c02264cce0f7", "totalAmount": 95000, "consultantId": "20b6c891-02d1-43ab-9ee4-65372be811b2"}}	::1	2026-08-11 10:30:13.54
f38ecea9-6119-4d44-8984-2c0f7bab768e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"name": "Kerala", "slug": "kerala", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": true, "categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "9b8a1f4d-1a76-49d4-8500-8d246813b537"], "description": "God's Own Country � backwaters, houseboats, hill stations and beaches."}}	::1	2026-08-11 11:19:17.39
fd8bc096-ff27-40df-a270-876ab5565a09	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"name": "Rajasthan", "slug": "rajasthan", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": true, "categoryIds": ["1706ce37-c954-4cf1-8c82-2bbdc673824c", "df40891d-c721-4f69-b045-980aec5875c3"], "description": "Royal palaces, golden deserts and vibrant culture across the land of kings."}}	::1	2026-08-11 11:19:17.609
5211b31c-9bf1-422f-8902-80d3e6cb1a4f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	521f62bf-b68e-4e85-a81c-f31eaba6d672	{"requestBody": {"name": "Munnar", "slug": "munnar", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": false, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "9708d859-30cf-40ee-b4a6-54f461311cde"], "description": "Rolling tea gardens and misty hills in the Western Ghats."}}	::1	2026-08-11 11:19:17.783
7fcf4acb-51a2-47b9-b2ff-c078330f0919	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	e1dc567d-b762-40ec-9075-60e04b80cc38	{"requestBody": {"name": "Gujarat", "slug": "gujarat", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": false, "categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "a5a0615a-980c-41c9-9855-88647ddd4a59"], "description": "The Rann of Kutch, Gir forest, and a rich heritage trail."}}	::1	2026-08-11 11:19:17.944
66700ff7-abd9-4406-8d12-1cadcd742920	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"name": "Himachal Pradesh", "slug": "himachal-pradesh", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": true, "categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "9708d859-30cf-40ee-b4a6-54f461311cde"], "description": "Snow-capped peaks, valleys and adventure sports in the Himalayas."}}	::1	2026-08-11 11:19:18.15
1ef369f8-d08f-400c-9dcd-718a0d380c53	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:03.757
b26ac01b-84c1-40ba-a3a1-a9213358d548	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"heroImageKey": "4f2d1c7a-35b5-4d32-8db9-da0b560fd0c7-kerala.jpg"}}	::1	2026-08-12 07:30:03.779
be513b40-2251-489c-9b28-0d2bb4c3b4cb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	5a8810cd-87b6-4d87-8434-a5e84705284b	{"requestBody": {"slug": "kerala-backwaters-munnar-family-escape", "title": "Kerala Backwaters & Munnar Family Escape", "hotels": [{"cityName": "Munnar", "mealPlan": "Breakfast", "roomType": "Deluxe", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Alleppey", "mealPlan": "All meals", "roomType": "Houseboat", "checkInDay": 3, "checkOutDay": 4}], "status": "PUBLISHED", "flights": [], "basePrice": 28500, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 28500}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [], "itineraryDays": [{"title": "Arrive Kochi, drive to Munnar", "dayNumber": 1, "activities": [{"name": "Tea garden visit"}]}, {"title": "Munnar sightseeing", "dayNumber": 2, "activities": [{"name": "Eravikulam National Park", "isOptional": true}]}, {"title": "Drive to Alleppey, houseboat check-in", "dayNumber": 3, "activities": [{"name": "Backwater cruise"}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-11 11:19:47.615
8fb0537b-5777-45e7-a6a5-6f90a54e012f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	82e2fc31-77dc-4c33-b1ba-202048ac14c2	{"requestBody": {"slug": "shimla-manali-adventure-trail", "title": "Shimla Manali Adventure Trail", "hotels": [{"cityName": "Shimla", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Manali", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 3, "checkOutDay": 6}], "status": "PUBLISHED", "flights": [], "basePrice": 19999, "durationDays": 6, "pricingTiers": [], "destinationId": "5849cc1d-988c-4310-b48d-7027c576718c", "galleryImages": [], "itineraryDays": [{"title": "Arrive Shimla", "dayNumber": 1, "activities": [{"name": "Mall Road walk"}]}, {"title": "Kufri excursion", "dayNumber": 2, "activities": [{"name": "Paragliding", "isOptional": true}]}, {"title": "Drive to Manali", "dayNumber": 3, "activities": [{"name": "River rafting", "isOptional": true}]}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-11 11:19:47.873
ad565405-1a24-4496-ab13-a64d6b1bdcdc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/admin/cancellation-requests/11ed285d-b91c-4183-8071-49d585e7558d/resolve	admin	11ed285d-b91c-4183-8071-49d585e7558d	{"requestBody": {"status": "APPROVED"}}	::1	2026-08-11 12:18:12.218
b763329f-213a-4314-8d0f-da1acce4e2bc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/reviews/7c8c7aa8-77f0-4642-933e-c089d9d37a92/status	reviews	7c8c7aa8-77f0-4642-933e-c089d9d37a92	{"requestBody": {"status": "APPROVED"}}	::1	2026-08-11 12:19:22.887
ca91f915-3f38-442d-8ecf-72a5cdc067db	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors/27436adf-9dfc-486d-ba40-12a04cba9903/portal-access	vendors	27436adf-9dfc-486d-ba40-12a04cba9903	{"requestBody": {"email": "patong.hotel@example.com"}}	::1	2026-08-11 12:52:41.312
457e8b4d-4ac1-4279-be58-34aa2e2c5eb0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors/abb87a3f-29ea-4135-9668-f4c83f080930/portal-access	vendors	abb87a3f-29ea-4135-9668-f4c83f080930	{"requestBody": {"email": "phiphi.tours@example.com"}}	::1	2026-08-11 12:53:46.762
309b9389-e97c-4d17-b6cc-c9e65ccc2873	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/vendors/27436adf-9dfc-486d-ba40-12a04cba9903/portal-access/reset-password	vendors	27436adf-9dfc-486d-ba40-12a04cba9903	{"requestBody": {}}	::1	2026-08-11 12:53:47.965
8c630465-3d72-4199-a27e-7b0903791eac	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/platform/tenants/81d175e9-d392-4f48-b13a-86fb6d7b9e8e/status	platform	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	{"requestBody": {"status": "SUSPENDED"}}	::1	2026-08-12 06:21:09.164
ccfa8a67-eb71-4a2e-a34c-43595d6f1daa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/platform/tenants/81d175e9-d392-4f48-b13a-86fb6d7b9e8e/status	platform	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	{"requestBody": {"status": "ACTIVE"}}	::1	2026-08-12 06:21:09.527
a75c12db-d03d-4015-ae88-c78c458ef55c	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	75b0ad19-2a3d-468a-b4d8-5b064868b3da	PATCH /api/v1/settings/branding	settings	unknown	{"requestBody": {"primaryColor": "#8b2fc9", "templateSlug": "modern"}}	::1	2026-08-12 06:21:39.436
ec5b4fa3-4635-4b7c-afce-53594fc4e9a3	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	75b0ad19-2a3d-468a-b4d8-5b064868b3da	POST /api/v1/settings/billing/activate	settings	unknown	{"requestBody": {}}	::1	2026-08-12 06:21:39.979
e7cf3905-bacf-422a-80b2-d627b79d5bb6	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	75b0ad19-2a3d-468a-b4d8-5b064868b3da	POST /api/v1/settings/billing/confirm	settings	2d2fe18f-53d9-47c6-afd1-e612068fba7d	{"requestBody": {"devConfirm": true}}	::1	2026-08-12 06:21:40.125
ca35008e-afc6-43f9-bb5b-f76f519ddebb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:01.647
0b4dfa3b-944d-4bac-9626-c119813a8791	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"heroImageKey": "f9617784-30ab-4935-9eb3-788f77c7d439-himachal-pradesh.jpg"}}	::1	2026-08-12 07:30:01.743
ece85b50-7451-44ef-bd0a-d964a6c76e71	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:02.227
650a02fe-e325-4d0a-a51e-ead69c7f9d9c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/e1dc567d-b762-40ec-9075-60e04b80cc38	destinations	e1dc567d-b762-40ec-9075-60e04b80cc38	{"requestBody": {"heroImageKey": "7a1de62c-de1c-42e1-9283-61af99645546-gujarat.jpg"}}	::1	2026-08-12 07:30:02.257
df2ea435-7943-4299-bf73-3a3d28d515b4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:02.693
6d985757-ca34-44c1-848c-fcb63387ddd1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/521f62bf-b68e-4e85-a81c-f31eaba6d672	destinations	521f62bf-b68e-4e85-a81c-f31eaba6d672	{"requestBody": {"heroImageKey": "95caa280-6185-4630-a8c9-33e5702f9882-munnar.jpg"}}	::1	2026-08-12 07:30:02.769
b0113a1e-4fe6-4605-a56c-330c371f6310	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:03.195
234ac6bb-c8f9-4067-ab5b-f20daef9e57d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:04.211
1099e7ac-07f6-4c8a-b230-fd6eff82ef86	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdd09d56-d5b9-4934-81f4-66ca7c90a58c	destinations	bdd09d56-d5b9-4934-81f4-66ca7c90a58c	{"requestBody": {"heroImageKey": "015b1274-6097-43db-9759-3caf02dc5eff-phuket.jpg"}}	::1	2026-08-12 07:30:04.256
f748cf57-6de3-4abe-8a6c-dbc390b70c99	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:04.749
cf48fb85-4cad-4c64-96dc-888533f44beb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/82e2fc31-77dc-4c33-b1ba-202048ac14c2	packages	82e2fc31-77dc-4c33-b1ba-202048ac14c2	{"requestBody": {"slug": "shimla-manali-adventure-trail", "title": "Shimla Manali Adventure Trail", "hotels": [{"cityName": "Shimla", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Manali", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 3, "checkOutDay": 6}], "status": "PUBLISHED", "flights": [], "basePrice": 19999, "durationDays": 6, "pricingTiers": [], "destinationId": "5849cc1d-988c-4310-b48d-7027c576718c", "galleryImages": [{"sortOrder": 0, "storageKey": "484fc1c1-5298-4b9c-aa97-0c7a7561a92b-shimla-manali-adventure-trail.jpg"}], "itineraryDays": [{"title": "Arrive Shimla", "dayNumber": 1, "activities": [{"name": "Mall Road walk", "isOptional": false}]}, {"title": "Kufri excursion", "dayNumber": 2, "activities": [{"name": "Paragliding", "isOptional": true}]}, {"title": "Drive to Manali", "dayNumber": 3, "activities": [{"name": "River rafting", "isOptional": true}]}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-12 07:30:04.979
c2dd4656-988b-4398-903f-2ede94f589da	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:05.465
f4f0adac-b8a5-471d-88bc-b76cfa4279cf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/5a8810cd-87b6-4d87-8434-a5e84705284b	packages	5a8810cd-87b6-4d87-8434-a5e84705284b	{"requestBody": {"slug": "kerala-backwaters-munnar-family-escape", "title": "Kerala Backwaters & Munnar Family Escape", "hotels": [{"cityName": "Munnar", "mealPlan": "Breakfast", "roomType": "Deluxe", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Alleppey", "mealPlan": "All meals", "roomType": "Houseboat", "checkInDay": 3, "checkOutDay": 4}], "status": "PUBLISHED", "flights": [], "basePrice": 28500, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 28500}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [{"sortOrder": 0, "storageKey": "80c8b0de-9909-48f4-8b8c-a8f96a090776-kerala-backwaters-munnar-family-escape.jpg"}], "itineraryDays": [{"title": "Arrive Kochi, drive to Munnar", "dayNumber": 1, "activities": [{"name": "Tea garden visit", "isOptional": false}]}, {"title": "Munnar sightseeing", "dayNumber": 2, "activities": [{"name": "Eravikulam National Park", "isOptional": true}]}, {"title": "Drive to Alleppey, houseboat check-in", "dayNumber": 3, "activities": [{"name": "Backwater cruise", "isOptional": false}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-12 07:30:05.596
1e813b23-61db-45e6-b6e6-c5998fca7fe8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 07:30:06.018
650323cc-be94-428d-911f-c8c34828233d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {"slug": "phuket-honeymoon-escape", "title": "Phuket Honeymoon Escape (Updated)", "hotels": [{"cityName": "Phuket", "checkInDay": 1, "checkOutDay": 5}], "status": "PUBLISHED", "flights": [], "basePrice": 52000, "durationDays": 5, "pricingTiers": [], "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c", "galleryImages": [{"sortOrder": 0, "storageKey": "acdc3db8-3aed-459e-892c-1efce34a72d9-phuket-honeymoon-escape.jpg"}], "itineraryDays": [{"title": "Arrival day", "dayNumber": 1, "activities": [{"name": "Snorkeling trip", "isOptional": false}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-12 07:30:06.075
1f5d3015-e99e-4982-b97f-e77d0a91c601	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	0e1e69e2-13fd-4faa-b0f9-7561944594dd	{"requestBody": {"rating": 5, "content": "Our Kerala backwaters trip was flawless — the houseboat stay was the highlight. Paxbook's consultant handled every detail.", "isFeatured": true, "customerName": "Ritika Sharma, Delhi"}}	::1	2026-08-12 07:30:06.089
dc3959c2-385e-4c25-aba1-0e2f97181fa1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	1f92b998-c429-4476-bd47-bcdd6729f269	{"requestBody": {"rating": 5, "content": "Went to Phuket for our honeymoon and it exceeded expectations. Great hotel picks and the itinerary had the perfect balance of activities and relaxation.", "isFeatured": true, "customerName": "Arjun Mehta, Mumbai"}}	::1	2026-08-12 07:30:06.11
40fb705b-ae04-419b-bc4d-976fb5ef234b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	b6dbe9fb-107c-4e51-84fa-e803fd3670cb	{"requestBody": {"rating": 4, "content": "Himachal road trip was beautifully planned. Minor hiccup with one hotel but the team resolved it within hours.", "isFeatured": true, "customerName": "Priya Nair, Bengaluru"}}	::1	2026-08-12 07:30:06.126
2bfe0092-f223-4ce8-82b3-2949653c1234	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	032845d8-a77f-40c9-96d8-4c8f031b73e7	{"requestBody": {"rating": 5, "content": "Rajasthan heritage tour felt truly premium — forts, food, and the desert camp were unforgettable. Highly recommend Paxbook.", "isFeatured": true, "customerName": "Karan Malhotra, Chandigarh"}}	::1	2026-08-12 07:30:06.143
584eb1b2-4b0b-49c8-86c8-ddf6e8f2f00c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	c19e529b-ff90-4132-bf2f-d931402ab508	{"requestBody": {"rating": 5, "content": "Booked a family trip to Munnar last minute and the team still pulled together a great itinerary within our budget.", "isFeatured": true, "customerName": "Sneha Iyer, Pune"}}	::1	2026-08-12 07:30:06.161
41a68acc-ab2a-4beb-9ae6-042a04b0f8bb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-12 08:39:13.218
98b08da1-72e1-44b1-ba71-f61cdddb548a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:34.637
b8843dc5-ee69-4a98-86f6-eb228a8e7446	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/settings/branding	settings	unknown	{"requestBody": {"primaryColor": "#1A3C8C", "logoStorageKey": "f1258226-2794-4e18-884c-ba4a5ccdb1e3-paxbook-logo.jpg"}}	::1	2026-08-12 08:39:13.258
87182ac0-e2cf-47b6-86b8-492e3d80b2ee	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "9708d859-30cf-40ee-b4a6-54f461311cde", "def0ffff-ee95-40c0-b756-c81c997b5723"], "description": "Mountain Bliss"}}	::1	2026-08-12 08:39:13.372
225f7566-7844-4f8f-babf-9b4a3e46a041	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/e1dc567d-b762-40ec-9075-60e04b80cc38	destinations	e1dc567d-b762-40ec-9075-60e04b80cc38	{"requestBody": {"categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "a5a0615a-980c-41c9-9855-88647ddd4a59", "692c3aa0-b876-4864-93d3-626d3b8fbcc5", "e6c26e10-c9bb-4b80-8266-48ce1b6c5538"], "description": "Vibrant Heritage"}}	::1	2026-08-12 08:39:13.45
29333e5f-e9c3-4e65-adf1-b21e176f3923	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/521f62bf-b68e-4e85-a81c-f31eaba6d672	destinations	521f62bf-b68e-4e85-a81c-f31eaba6d672	{"requestBody": {"categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "9708d859-30cf-40ee-b4a6-54f461311cde", "6882361d-c3c3-4338-834d-ff17694a4d3a"], "description": "Tea Valley"}}	::1	2026-08-12 08:39:13.536
2730679e-613d-4e01-bbd3-2dc873301e55	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"categoryIds": ["1706ce37-c954-4cf1-8c82-2bbdc673824c", "df40891d-c721-4f69-b045-980aec5875c3", "def0ffff-ee95-40c0-b756-c81c997b5723", "692c3aa0-b876-4864-93d3-626d3b8fbcc5"], "description": "Land of Royals"}}	::1	2026-08-12 08:39:13.609
1b90d713-02ab-439a-8666-19f6fb5cc98d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "9b8a1f4d-1a76-49d4-8500-8d246813b537", "6882361d-c3c3-4338-834d-ff17694a4d3a"], "description": "God's Own Country"}}	::1	2026-08-12 08:39:13.671
08f751cd-16e8-4865-bc9d-889d31829217	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/cms/testimonials/0e1e69e2-13fd-4faa-b0f9-7561944594dd	cms	0e1e69e2-13fd-4faa-b0f9-7561944594dd	{"requestBody": {}}	::1	2026-08-12 08:39:13.729
c4bc2c11-9261-4040-8440-e38725791c4b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/cms/testimonials/1f92b998-c429-4476-bd47-bcdd6729f269	cms	1f92b998-c429-4476-bd47-bcdd6729f269	{"requestBody": {}}	::1	2026-08-12 08:39:13.749
3fcb939d-2d63-42e7-a405-383e42826687	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/cms/testimonials/b6dbe9fb-107c-4e51-84fa-e803fd3670cb	cms	b6dbe9fb-107c-4e51-84fa-e803fd3670cb	{"requestBody": {}}	::1	2026-08-12 08:39:13.77
ee5126f8-2045-4ecc-a257-60d174c53a24	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/cms/testimonials/032845d8-a77f-40c9-96d8-4c8f031b73e7	cms	032845d8-a77f-40c9-96d8-4c8f031b73e7	{"requestBody": {}}	::1	2026-08-12 08:39:13.804
4e3a39f4-c921-40ad-b2ad-bdf150a0a47a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/cms/testimonials/c19e529b-ff90-4132-bf2f-d931402ab508	cms	c19e529b-ff90-4132-bf2f-d931402ab508	{"requestBody": {}}	::1	2026-08-12 08:39:13.826
37928357-ac41-4ff7-b85b-e9c180926eed	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	17a07e96-dc16-483e-a5ae-5deed72158d1	{"requestBody": {"rating": 5, "content": "After reading and learning so much about Mahatma Gandhi, visiting his birthplace in Gujarat was a deeply meaningful experience for me. Huge thanks to Paxbook for seamlessly organizing this special journey and making it truly unforgettable!", "isFeatured": true, "customerName": "Bhupendra Singh, Porbandar"}}	::1	2026-08-12 08:39:13.863
827e7b97-90e0-40c6-938b-57d973403a63	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	b66cb4c4-5a85-4493-8576-242a717ef98e	{"requestBody": {"rating": 5, "content": "Breathtaking views, wonderful vibes, and top-tier service! Huge thanks to Paxbook for organizing an amazing trip to Manali. Paxbook took care of every single detail so we could just relax and soak in the mountain vibes.", "isFeatured": true, "customerName": "Ankit Mewara, Manali"}}	::1	2026-08-12 08:39:13.885
ea909e1f-5379-4537-8eb7-dfef2bd6e619	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	9e32c03e-4040-4fc7-8ff1-98f18d405515	{"requestBody": {"rating": 5, "content": "4 Jyotirlingas, endless blessings, and 1 seamless trip! Couldn't have completed this journey across Mahakaleshwar, Omkareshwar, Trimbakeshwar and Grishneshwar without the fantastic support of Paxbook. Highly recommend Paxbook for anyone planning a hassle-free religious circuit!", "isFeatured": true, "customerName": "Ramavtar Meena, Trimbakeshwar"}}	::1	2026-08-12 08:39:13.904
76c9fdd8-4ef3-4c86-b7a9-fc1dbb8746b5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/testimonials	cms	43156672-4458-4791-8c93-a18ac91c9a04	{"requestBody": {"rating": 5, "content": "It was my best decision to book a holiday package with Paxbook. My travel expert gave me the best service, exactly as promised — best food, best stay, and a most memorable trip. Thank you Paxbook!", "isFeatured": true, "customerName": "Sheetal Nagar"}}	::1	2026-08-12 08:39:13.935
925bb1fb-92c4-4089-a228-b096b9adaa4f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	1c39245e-c86f-41c1-b09e-26b201c99cc1	{"requestBody": {"slug": "bangkok-street-food-temples-trail", "title": "Bangkok Street Food & Temples Trail", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 32000, "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 32000}], "destinationId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "galleryImages": [{"sortOrder": 0, "storageKey": "d580fd96-4385-4747-89dc-d50b03a5d2c7-bangkok-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Bangkok", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bangkok", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Bangkok", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 4, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 3, "routeMapPoints": []}}	::1	2026-08-19 04:19:34.748
b3ad0820-f4c4-4af3-8ddd-2743a1b5965b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/homepage-blocks	cms	8d30256b-33f2-4dc2-99b7-6b03f99e5506	{"requestBody": {"type": "why_choose", "sortOrder": 0, "configJson": {"items": [{"icon": "🧳", "title": "Customized for You", "description": "100% customized tours made around you."}, {"icon": "🎧", "title": "Always by Your Side", "description": "24 X 7 customer support whenever you need us."}, {"icon": "🛡️", "title": "Trusted & Reliable", "description": "No scam, just the faith of lakhs of happy customers."}, {"icon": "🤝", "title": "Promise is Our Priority", "description": "What we promise, we deliver."}, {"icon": "🏨", "title": "Handpicked with Care", "description": "Hand selected properties and tours for the best experience."}, {"icon": "🧳", "title": "Worry Free Travel", "description": "Relax and enjoy, we take care of everything."}, {"icon": "🎧", "title": "Dedicated Expert Support", "description": "A dedicated expert before, during and after the trip for your feedback."}, {"icon": "⚙️", "title": "Our Service", "description": "Seamless, reliable and designed for your complete satisfaction."}, {"icon": "🚩", "title": "Experts with You", "description": "Our experts will accompany large groups for a more comfortable journey."}], "title": "Paxbook?", "eyebrow": "Why Choose"}}}	::1	2026-08-12 08:39:13.994
3c3d59b3-4cff-40f9-9f41-375fccca717f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/homepage-blocks	cms	640e6fb6-2e6b-4b15-8e48-682113626016	{"requestBody": {"type": "traveler_types", "sortOrder": 1, "configJson": {"items": [{"color": "rose", "label": "Couple", "category": "Couple"}, {"color": "emerald", "label": "Family", "category": "Family"}, {"color": "amber", "label": "Friends", "category": "Friends"}, {"color": "blue", "label": "Group", "category": "Group"}, {"color": "violet", "label": "Corporate", "category": "Corporate"}], "title": "Are you a?"}}}	::1	2026-08-12 08:39:14.007
1fc9eb12-7d83-4150-829e-7bbe41f5dfe0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/homepage-blocks	cms	a06e38f3-6ed4-4214-8a46-691504197c47	{"requestBody": {"type": "how_it_works", "sortOrder": 2, "configJson": {"steps": [{"step": 1, "title": "Share Your Travel Plans", "description": "Tell us where you want to go — our expert finds you the best itinerary at the best fare."}, {"step": 2, "title": "We Curate & Confirm", "description": "Your dedicated expert handles hotels, transport and every detail so you don't have to."}, {"step": 3, "title": "Get Your Booking Confirmation", "description": "Receive your confirmed itinerary, invoice and travel voucher — ready for a stress-free trip."}], "title": "Your dedicated expert, every step of the way", "eyebrow": "Now booking has become easy"}}}	::1	2026-08-12 08:39:14.028
63b8511c-7296-48db-8725-a69f9deddad3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/cms/homepage-blocks/8d30256b-33f2-4dc2-99b7-6b03f99e5506	cms	8d30256b-33f2-4dc2-99b7-6b03f99e5506	{"requestBody": {"type": "why_choose", "sortOrder": 0, "configJson": {"items": [{"icon": "luggage", "title": "Customized for You", "description": "100% customized tours made around you."}, {"icon": "headphones", "title": "Always by Your Side", "description": "24 X 7 customer support whenever you need us."}, {"icon": "shield-check", "title": "Trusted & Reliable", "description": "No scam, just the faith of lakhs of happy customers."}, {"icon": "handshake", "title": "Promise is Our Priority", "description": "What we promise, we deliver."}, {"icon": "hotel", "title": "Handpicked with Care", "description": "Hand selected properties and tours for the best experience."}, {"icon": "shield-plus", "title": "Worry Free Travel", "description": "Relax and enjoy, we take care of everything."}, {"icon": "user-round", "title": "Dedicated Expert Support", "description": "A dedicated expert before, during and after the trip for your feedback."}, {"icon": "settings", "title": "Our Service", "description": "Seamless, reliable and designed for your complete satisfaction."}, {"icon": "flag", "title": "Experts with You", "description": "Our experts will accompany large groups for a more comfortable journey."}], "title": "Paxbook?", "eyebrow": "Why Choose"}}}	::1	2026-08-14 04:48:42.182
a523b065-d1c7-4b65-bb9a-c3a5cbfb04ad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/settings/integrations	settings	unknown	{"requestBody": {"razorpayKeyId": "rzp_test_1234567890", "twilioAuthToken": "test_auth_token_xyz", "twilioAccountSid": "ACtest1234567890", "twilioFromNumber": "+15005550006", "razorpayKeySecret": "test_secret_abcdef123456", "twilioWhatsappFromNumber": "whatsapp:+14155238886"}}	::1	2026-08-14 08:26:15.742
8e5ec021-9a94-425d-a765-4f6df6446cd7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/settings/branding	settings	unknown	{"requestBody": {"primaryColor": "#19377F"}}	::1	2026-08-18 11:26:21.775
9aedd8ac-1074-4b71-b0b7-fb43629eb5e1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:31.157
3428484c-6955-4a07-aa60-04a8227301ed	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"name": "Bali", "slug": "bali", "countryId": "1c5c825e-ba41-4bf9-a15b-caa9b04f305d", "isFeatured": false, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "6882361d-c3c3-4338-834d-ff17694a4d3a"], "description": "Rice terraces, cliff temples and warm island evenings", "heroImageKey": "49a7240c-d967-46e8-afbf-447c329b4422-bali.jpg"}}	::1	2026-08-19 04:19:31.289
3ec4ffe2-833e-4eb1-b496-f420aa523d2e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:31.677
ced7116d-4f2e-4e0a-b635-1423c320b41a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:35.605
4bd34adc-cba6-44ef-a44e-561b129966be	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"name": "Singapore", "slug": "singapore", "countryId": "41f88819-174f-4932-a283-11569951c20a", "isFeatured": false, "categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "e6c26e10-c9bb-4b80-8266-48ce1b6c5538"], "description": "Futuristic gardens, hawker feasts and a city built for families", "heroImageKey": "aa9ddd1e-810b-40e3-8aba-b1a82fd8f201-singapore.jpg"}}	::1	2026-08-19 04:19:35.679
17dfe471-92ee-4557-83a3-a547359305ed	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:36.086
f8ae67fd-9b57-446a-a804-df14b811e447	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.689
21abac32-fd6b-468b-af42-146edf6b02c9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	4e7f5e85-4690-498d-8335-39af4921034b	{"requestBody": {"slug": "bali-honeymoon-escape", "title": "Bali Honeymoon Escape", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 65000, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 65000}], "destinationId": "25534ce5-2b51-4471-9600-127036598b4b", "galleryImages": [{"sortOrder": 0, "storageKey": "c3205fbe-f885-48a0-9c13-f07b92980449-bali-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Bali", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bali", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Bali", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Bali", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Bali", "dayNumber": 5, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 04:19:31.771
5f4ba3d2-6763-4e61-8715-155411792583	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:32.207
e01b62e3-a158-4c47-bfee-f97860a97736	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"name": "Maldives", "slug": "maldives", "countryId": "c6d88296-0db9-401c-a25d-08694f5ff6b2", "isFeatured": false, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "1706ce37-c954-4cf1-8c82-2bbdc673824c"], "description": "Overwater villas and turquoise lagoons made for slowing down", "heroImageKey": "b9bf3666-c146-434c-86dc-928f2c2f1c75-maldives.jpg"}}	::1	2026-08-19 04:19:32.281
a3467e2b-b574-4daf-abaf-3452da50d946	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:32.806
6da6a250-fdfe-4c91-955f-dd8d9db4af6e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	5615d775-f89b-470f-8f4a-f8a38a881bd2	{"requestBody": {"slug": "maldives-overwater-villa-retreat", "title": "Maldives Overwater Villa Retreat", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 95000, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 95000}], "destinationId": "f57f1a08-d092-407c-bc01-962f7328974f", "galleryImages": [{"sortOrder": 0, "storageKey": "1dc7f138-6ab2-400b-b4e3-338227f0db54-maldives-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Maldives", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Maldives", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Maldives", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Maldives", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 04:19:32.853
4ff6a8df-1a73-4db1-9415-528d2ec15a49	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:33.219
3a34457d-2770-4f46-b33e-214219c5e17b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"name": "Dubai", "slug": "dubai", "countryId": "6dfc27c2-1f08-46fb-b3c9-5fc166cbcbde", "isFeatured": false, "categoryIds": ["df40891d-c721-4f69-b045-980aec5875c3", "1706ce37-c954-4cf1-8c82-2bbdc673824c", "def0ffff-ee95-40c0-b756-c81c997b5723"], "description": "Desert dunes, skyline views and duty-free shopping sprees", "heroImageKey": "48a9c725-c807-424b-9cc0-356548c40676-dubai.jpg"}}	::1	2026-08-19 04:19:33.237
f4b40013-db7a-4687-8610-2b03ef2f60de	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:33.649
c18e1434-f198-4dcf-b605-25103778b6ec	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	fbce3a52-8e3d-4629-a97b-d27108ee670e	{"requestBody": {"slug": "dubai-city-desert-explorer", "title": "Dubai City & Desert Explorer", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 58000, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 58000}], "destinationId": "2824d140-2702-4a58-a0aa-6030c8134362", "galleryImages": [{"sortOrder": 0, "storageKey": "98b65dd4-f23a-4417-9fcd-51dae087c56f-dubai-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Dubai", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Dubai", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Dubai", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Dubai", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 04:19:33.691
ef30dc94-f153-4ee0-bfec-f9ab64a8ff0e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:34.091
89ecd2d5-b3e3-4688-8dae-780e1b012ea2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"name": "Bangkok", "slug": "bangkok", "countryId": "fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995", "isFeatured": false, "categoryIds": ["def0ffff-ee95-40c0-b756-c81c997b5723", "9708d859-30cf-40ee-b4a6-54f461311cde", "a5a0615a-980c-41c9-9855-88647ddd4a59"], "description": "Street food, golden temples and a skyline that never sleeps", "heroImageKey": "d3738001-c54f-4261-a72a-bf008940fd5b-bangkok.jpg"}}	::1	2026-08-19 04:19:34.161
4098182d-70d9-4b98-ac31-427de74ef42f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	{"requestBody": {"slug": "singapore-family-discovery", "title": "Singapore Family Discovery", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 72000, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 72000}], "destinationId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "galleryImages": [{"sortOrder": 0, "storageKey": "26379d33-e060-44e8-87b6-0c0c5f20a7b9-singapore-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Singapore", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Singapore", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Singapore", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Singapore", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 04:19:36.159
21432329-d832-4a4e-92b7-99c6b7abcfd3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:36.55
a01abe32-3fbf-4dd0-bc99-5f9c96e45232	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"name": "Ha Long Bay", "slug": "ha-long-bay", "countryId": "1f75f43e-cbe1-41f0-8cf0-3cd080586511", "isFeatured": false, "categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "6882361d-c3c3-4338-834d-ff17694a4d3a"], "description": "Limestone karsts rising out of an emerald bay", "heroImageKey": "2109ea5f-b311-49b3-9f69-5c2e993e080d-ha-long-bay.jpg"}}	::1	2026-08-19 04:19:36.622
2bfd691d-458e-4569-964e-cab411688263	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:37.117
83c353b0-2091-41f9-9d68-5f56a7127edd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	{"requestBody": {"slug": "ha-long-bay-cruise-adventure", "title": "Ha Long Bay Cruise Adventure", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 45000, "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 45000}], "destinationId": "d487d421-1b6a-47af-aa02-a06fd7a09dfc", "galleryImages": [{"sortOrder": 0, "storageKey": "bbb601b9-5de1-46ad-82e0-761a2074c177-ha-long-bay-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Ha Long Bay", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Ha Long Bay", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Ha Long Bay", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 4, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 3, "routeMapPoints": []}}	::1	2026-08-19 04:19:37.219
4728c23f-e3b8-4b91-80a4-13bcc5ae3d1a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:37.719
a744baac-0b8c-479c-beb4-05baf4e69d35	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"name": "Langkawi", "slug": "langkawi", "countryId": "f62c9849-c9ed-4836-a657-db755502a035", "isFeatured": false, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "df40891d-c721-4f69-b045-980aec5875c3"], "description": "Rainforest cable cars and duty-free island beaches", "heroImageKey": "500dc6d2-69fa-4b7b-8ab0-5067367f01c7-langkawi.jpg"}}	::1	2026-08-19 04:19:37.794
42a569ea-0354-4dbe-a6df-2764b3019f74	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:38.196
659a6b4a-a069-4fd0-a280-d4c73a467d28	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	753e5a1a-15af-4801-9f08-8549b1cfd15b	{"requestBody": {"slug": "langkawi-island-getaway", "title": "Langkawi Island Getaway", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 52000, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 52000}], "destinationId": "2c239102-080c-4345-aa90-6f25024979fc", "galleryImages": [{"sortOrder": 0, "storageKey": "3aa225f2-9fc8-417c-8a26-3a2e75d40522-langkawi-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Langkawi", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Langkawi", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Langkawi", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Langkawi", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 04:19:38.331
4faa37fd-6b7f-4032-998c-68b6d4aea87a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:40.045
ecf234cf-bb4a-4c3e-9db4-8423b68ae50a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"name": "Kyoto", "slug": "kyoto", "countryId": "4af9d23d-1fdd-46d9-94ea-e40837863259", "isFeatured": false, "categoryIds": ["1706ce37-c954-4cf1-8c82-2bbdc673824c", "6882361d-c3c3-4338-834d-ff17694a4d3a", "33a94a3b-5ae3-4cca-9ba6-e356edd63fcc"], "description": "Ancient temples, cherry blossoms and quiet bamboo groves", "heroImageKey": "13e1a7b7-7464-49d2-9776-6a0345e6a1c9-kyoto.jpg"}}	::1	2026-08-19 04:19:40.115
fcb3b540-c83f-46d0-bdea-e05ce628bd07	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:40.601
ea8376b2-9983-4902-9154-e29c76a1bbbb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	c0c8129c-ba80-4771-93f2-8da1edc56ee4	{"requestBody": {"slug": "kyoto-cultural-immersion", "title": "Kyoto Cultural Immersion", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 110000, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 110000}], "destinationId": "42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48", "galleryImages": [{"sortOrder": 0, "storageKey": "3ff6ad5e-3a52-4981-b3da-0f7b0c6e8913-kyoto-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Kyoto", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Kyoto", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Kyoto", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Kyoto", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Kyoto", "dayNumber": 5, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 04:19:40.678
6d76e946-a376-4155-852d-20247e418709	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:41.08
cec2c180-dd07-48fa-9803-eada7364c438	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"name": "Interlaken", "slug": "interlaken", "countryId": "d64f23b4-8684-41e0-b0e3-739bf0c30a7a", "isFeatured": false, "categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "1706ce37-c954-4cf1-8c82-2bbdc673824c"], "description": "Alpine peaks, glacier lakes and adventure sports at every turn", "heroImageKey": "2cbed593-a0ad-4c6d-afb7-e353ac602bba-interlaken.jpg"}}	::1	2026-08-19 04:19:41.146
04438059-8eb6-4943-af93-9205fb8f1b70	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 04:19:41.617
b4b04520-04b7-4b41-8f0a-6d1cc5251dcd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	518aee17-5f2f-4d00-ba85-2095083bc6a9	{"requestBody": {"slug": "interlaken-alpine-adventure", "title": "Interlaken Alpine Adventure", "hotels": [], "status": "DRAFT", "flights": [], "basePrice": 135000, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 135000}], "destinationId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "galleryImages": [{"sortOrder": 0, "storageKey": "1cd0d661-51a0-4bd3-9fe9-1a3918932ce0-interlaken-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Interlaken", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Interlaken", "dayNumber": 2, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Interlaken", "dayNumber": 3, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Interlaken", "dayNumber": 4, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Explore Interlaken", "dayNumber": 5, "description": "Guided sightseeing and local experiences — itinerary to be finalized by your travel expert."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 04:19:41.69
2a7f0f26-1297-48f1-8651-ac9757c61246	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.234
987d7984-2d3e-48fe-8634-e9b7f20d1fa5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/settings/branding	settings	unknown	{"requestBody": {"logoStorageKey": "06843db4-2d83-4ce5-9a75-438f21ef2664-logo.jpg"}}	::1	2026-08-19 05:15:39.287
c8e00c38-7d8c-4ded-b8e6-c5c1aafffbc6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.421
82bf3bb4-7ed7-49b2-9997-4569bffe5cc6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"description": "Rice terraces, cliff temples and warm island evenings.", "heroImageKey": "5f96a70d-1cdd-4ba8-bbb5-c6b4a9e374e7-bali-C-ZvmxxP.jpg"}}	::1	2026-08-19 05:15:39.484
0890e387-371d-41b3-bd70-79442ad1eee9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.519
4fc62be4-a44d-4d4c-917a-45d0979178f3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"description": "Overwater villas, house reefs and absolute quiet.", "heroImageKey": "7c7076d8-5589-4bd2-b23d-0a75676db41b-maldives-DgCIoG22.jpg"}}	::1	2026-08-19 05:15:39.552
1e9b1c40-e430-4830-bd00-7d154f7dd050	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.618
16dc7b93-b01f-4e76-a5ac-68a1e0f7ed79	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"description": "Skyline views, desert nights and effortless family days.", "heroImageKey": "c4195940-10f4-42e8-9549-2f9259be9cf7-dubai-DRCuuGaX.jpg"}}	::1	2026-08-19 05:15:39.639
e79d2a41-7346-48c7-abe7-8796f760c3b8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.669
43fc1676-1ae2-4989-9cb3-37e7e5fb26a8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"description": "Island hopping, street food and easy value.", "heroImageKey": "66107ef1-4dca-46bf-97ef-67441618a134-thailand-C2yi6qi_.jpg"}}	::1	2026-08-19 05:15:39.707
8ec0d45e-e3ee-40e9-84ee-9f77d6c8bf67	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.724
6d55ba6d-dfe8-454e-aff5-97276c832647	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"description": "Compact, spotless and made for family itineraries.", "heroImageKey": "3aafe5b1-6f36-46d4-93b2-067c3855d131-singapore-D61jditK.jpg"}}	::1	2026-08-19 05:15:39.752
9cdbef2f-6a3d-479c-b72b-afb64d8e4e27	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.774
020fb024-7309-43b5-835b-a90fa52d607b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"description": "Ha Long cruises, old towns and remarkable value.", "heroImageKey": "704066f9-2ba1-4d6e-98ff-24b70658c284-vietnam-CQl4Behy.jpg"}}	::1	2026-08-19 05:15:39.812
d0104c0d-0843-4f89-8883-4a9c655cc384	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.834
62f63797-8e1a-4d35-a5e7-c581988274dc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"description": "Rainforest islands and a very easy first flight abroad.", "heroImageKey": "1898b76a-7fed-44ac-b172-cccaaa06e0ec-malaysia-3pBlUwOK.jpg"}}	::1	2026-08-19 05:15:39.872
b0a02238-87be-4618-930f-c348937a4687	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.893
31653328-d2d2-4dfc-ab89-12f756546d27	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"description": "Bullet trains, blossom season and precise, beautiful days.", "heroImageKey": "d1e876d1-5f1c-4a7b-b525-9027f5d8c0b0-japan-B4XzdyJ_.jpg"}}	::1	2026-08-19 05:15:39.922
327618d8-2ae6-4aef-bec0-a6d5cdb326c3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:39.963
d6486691-4e6e-4ef5-b16e-e8da53ef745c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"description": "Alpine peaks, glacier lakes and adventure sports at every turn.", "heroImageKey": "238873a2-0cfa-4abe-9a82-8032dbe9a228-switzerland-D5Q0EHJx.jpg"}}	::1	2026-08-19 05:15:39.99
59533057-9634-42b7-8272-2ceb361f01dc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.003
5ed64b6b-95d8-49fb-9779-33e8125e93bf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"name": "Goa", "slug": "goa", "countryId": "9cac769d-1711-4dfb-984b-c23db1b7ddba", "isFeatured": false, "categoryIds": ["def0ffff-ee95-40c0-b756-c81c997b5723", "9708d859-30cf-40ee-b4a6-54f461311cde"], "description": "Beach shacks, Portuguese lanes and an easy weekend reset.", "heroImageKey": "1a1c50e5-1c97-4a94-b5b4-73fd8858e0d5-goa-DegD7h4J.jpg"}}	::1	2026-08-19 05:15:40.045
4a51a916-7151-42ff-840b-29e9cbae081f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.08
2d1ef3ae-3d10-44cd-954e-6a71c4a1ab12	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"name": "Sri Lanka", "slug": "sri-lanka", "countryId": "260f1c6c-0987-4101-be33-00795c9e95ed", "isFeatured": false, "categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "df40891d-c721-4f69-b045-980aec5875c3"], "description": "Tea hills, ancient temples and coastlines minutes apart.", "heroImageKey": "445b056f-8032-4ff0-9be1-f84c0cc6b426-srilanka-Da6P_Ceq.jpg"}}	::1	2026-08-19 05:15:40.103
3b0cf4de-7c69-4369-a674-a3b7dd6dd3c6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.125
7f8b6af0-c384-4d56-be7e-4e08d8e866f9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"name": "Mauritius", "slug": "mauritius", "countryId": "3a0819ff-2ceb-49b9-9605-2de701abd818", "isFeatured": false, "categoryIds": ["9b8a1f4d-1a76-49d4-8500-8d246813b537", "1706ce37-c954-4cf1-8c82-2bbdc673824c"], "description": "Lagoon blues, resort luxury and an easy visa on arrival.", "heroImageKey": "3814e6fb-8987-4e41-9319-07e8a7d5fffc-mauritius-2f6pm7cU.jpg"}}	::1	2026-08-19 05:15:40.362
f531a5cc-8d73-4f11-87b1-bdb0e13883ab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.513
183676b5-15c7-4f6f-bc4d-de1f89b9758e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"name": "Bhutan", "slug": "bhutan", "countryId": "2b1ac0d6-fdfe-4e8c-9076-0fc317a82301", "isFeatured": false, "categoryIds": ["a5a0615a-980c-41c9-9855-88647ddd4a59", "33a94a3b-5ae3-4cca-9ba6-e356edd63fcc"], "description": "Monasteries in the clouds and a permit instead of a visa.", "heroImageKey": "3769ad36-282a-4670-81cb-ac600d476ab6-bhutan-BIZjWjkR.jpg"}}	::1	2026-08-19 05:15:40.556
4dd095d2-f2ef-4e32-ab58-af2699bca952	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.639
2e6873a1-361f-487d-b4ef-22d8a43ecfb6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	4b1243ae-b604-4795-9954-6e50548a2be9	{"requestBody": {"slug": "goa-long-weekend", "title": "Goa Long Weekend", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 16900, "durationDays": 3, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 16900}], "destinationId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "galleryImages": [{"sortOrder": 0, "storageKey": "70af56e4-0ce1-4ddc-9d43-f14685c273d8-goa-DegD7h4J.jpg"}], "itineraryDays": [{"title": "Arrival in Goa", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Goa", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 3, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 2, "routeMapPoints": []}}	::1	2026-08-19 05:15:41.525
8cb36409-40f0-4706-92d8-75db2befdae1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/4e7f5e85-4690-498d-8335-39af4921034b	packages	4e7f5e85-4690-498d-8335-39af4921034b	{"requestBody": {"slug": "bali-honeymoon-escape", "title": "Bali Honeymoon Escape", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 58900, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 58900}], "destinationId": "25534ce5-2b51-4471-9600-127036598b4b", "galleryImages": [{"sortOrder": 0, "storageKey": "9f33283f-b3d3-47dc-8b4c-1992e768476d-bali-C-ZvmxxP.jpg"}], "itineraryDays": [{"title": "Arrival in Bali", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bali", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 5, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 05:15:40.759
67a7f5e2-dd1f-424b-a564-1db4555a0eea	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.782
827b5a27-bf5a-4cc5-b70d-3273003ec2ac	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/5615d775-f89b-470f-8f4a-f8a38a881bd2	packages	5615d775-f89b-470f-8f4a-f8a38a881bd2	{"requestBody": {"slug": "maldives-overwater-villa-retreat", "title": "Maldives Water Villa Retreat", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 118900, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 118900}], "destinationId": "f57f1a08-d092-407c-bc01-962f7328974f", "galleryImages": [{"sortOrder": 0, "storageKey": "26209972-e947-4a22-b170-56fda5b1a9b8-maldives-DgCIoG22.jpg"}], "itineraryDays": [{"title": "Arrival in Maldives", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Maldives", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Maldives", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Maldives", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 05:15:40.833
dfe15d81-0d33-4534-9944-1111866ade19	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.844
148627e6-3dcd-46ca-8020-c5234f313181	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/fbce3a52-8e3d-4629-a97b-d27108ee670e	packages	fbce3a52-8e3d-4629-a97b-d27108ee670e	{"requestBody": {"slug": "dubai-city-desert-explorer", "title": "Dubai Family Holiday", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 61900, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 61900}], "destinationId": "2824d140-2702-4a58-a0aa-6030c8134362", "galleryImages": [{"sortOrder": 0, "storageKey": "734068ad-a5cb-463b-a597-19165acfae94-dubai-DRCuuGaX.jpg"}], "itineraryDays": [{"title": "Arrival in Dubai", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Dubai", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Dubai", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Dubai", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 05:15:40.895
48915bf7-02d8-480d-8193-73afe4d84c39	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.907
41db8247-bfd9-4c0a-8be9-bb6a511f69d1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/1c39245e-c86f-41c1-b09e-26b201c99cc1	packages	1c39245e-c86f-41c1-b09e-26b201c99cc1	{"requestBody": {"slug": "bangkok-street-food-temples-trail", "title": "Thailand Island Hopper", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 44900, "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 44900}], "destinationId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "galleryImages": [{"sortOrder": 0, "storageKey": "92aeaf03-e553-4cdf-811b-ba6941d510ce-thailand-C2yi6qi_.jpg"}], "itineraryDays": [{"title": "Arrival in Bangkok", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bangkok", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bangkok", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 4, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 3, "routeMapPoints": []}}	::1	2026-08-19 05:15:40.957
5e7a2d93-8a7c-4c99-9552-515599b3eac5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:40.967
3ae8e30b-2435-4967-a8fc-6890a8628f37	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"heroImageKey": "83eccbae-ca6d-4c06-be32-86aa53b39d35-rajasthan-oD07PIG2.jpg"}}	::1	2026-08-19 05:19:19.504
72a51492-924c-41cb-8432-88d08c417f1b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.547
40a29d20-b18f-4598-833e-3a682d78e751	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.598
7f00934d-adcc-4fac-bf5c-bf52e5d076f7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/9fb09db3-7da0-4e3d-aecd-42b2201c2d60	packages	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	{"requestBody": {"slug": "singapore-family-discovery", "title": "Singapore + Malaysia Combo", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 78900, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 78900}], "destinationId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "galleryImages": [{"sortOrder": 0, "storageKey": "44b0b38f-e12c-4bda-8b52-11f2b76c0a8b-singapore-D61jditK.jpg"}], "itineraryDays": [{"title": "Arrival in Singapore", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Singapore", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Singapore", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Singapore", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 05:15:41.006
8e85ed45-e6cf-460d-903a-e7c07d4aef52	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:41.024
f178cabc-deaf-48d5-bcd9-4c12b489cfcf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/518aee17-5f2f-4d00-ba85-2095083bc6a9	packages	518aee17-5f2f-4d00-ba85-2095083bc6a9	{"requestBody": {"slug": "interlaken-alpine-adventure", "title": "Switzerland Alpine Classic", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 189900, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 189900}], "destinationId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "galleryImages": [{"sortOrder": 0, "storageKey": "5872958f-c810-47d6-947f-533d6335f919-switzerland-D5Q0EHJx.jpg"}], "itineraryDays": [{"title": "Arrival in Interlaken", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Interlaken", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 5, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 05:15:41.078
9f9db558-f948-40ec-b1b9-175b89a2738b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:41.103
d44c4e37-4fe3-436b-8792-abb2b5c07142	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	f989fedd-4be6-4adf-83ac-c794cf3a4831	{"requestBody": {"slug": "kerala-backwater-serenity", "title": "Kerala Backwater Serenity", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 26900, "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 26900}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [{"sortOrder": 0, "storageKey": "6ecdfd05-8c45-426d-9dcb-a86da8458fb1-kerala-BRDUcEbv.jpg"}], "itineraryDays": [{"title": "Arrival in Kerala", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Kerala", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Kerala", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Kerala", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-19 05:15:41.137
d2d4bb1b-f890-4355-84ca-0a84eb34bb8a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:41.162
07019f87-4b80-4b94-8c3d-74a8eb156fd4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	cded3556-e733-41ce-982a-9cce008c17a2	{"requestBody": {"slug": "rajasthan-royal-trail", "title": "Rajasthan Royal Trail", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 32900, "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 32900}], "destinationId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "galleryImages": [{"sortOrder": 0, "storageKey": "a7b18a12-4bdb-4263-9453-c7afa7958b64-rajasthan-oD07PIG2.jpg"}], "itineraryDays": [{"title": "Arrival in Rajasthan", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Rajasthan", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 5, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-19 05:15:41.232
1e41afde-3857-4a89-86a5-681e97bf6e61	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:15:41.26
df4377d1-a9cc-44eb-9f0e-437104dd03b2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:19:19.404
cb157c64-06d3-4adb-b1b7-217fe9e32220	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"heroImageKey": "2bc3821d-3e17-464d-8764-f88401ed80b8-kerala-BRDUcEbv.jpg"}}	::1	2026-08-19 05:19:19.457
6d4188e4-516f-4d1b-89f7-f4d2220bf85a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-19 05:19:19.475
62342015-0f7d-4591-93f9-e658d74991c7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.727
4920b330-34c7-4bc2-82f1-54e3f3c60e8a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:10.383
69801c73-f5e5-4cb8-8944-600b58f93ed4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:10.537
aeb83a72-a91a-4dbf-b60c-76a255401553	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"isFeatured": false}}	::1	2026-08-19 05:21:34.622
a474acfd-3974-4680-85c8-55f16f304c9f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"isFeatured": false}}	::1	2026-08-19 05:21:34.654
dbdea3d1-1b63-4d11-a183-43214378230f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"isFeatured": false}}	::1	2026-08-19 05:21:34.675
e470fb63-7d0d-4cc8-9b05-4e49f00dc559	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdd09d56-d5b9-4934-81f4-66ca7c90a58c	destinations	bdd09d56-d5b9-4934-81f4-66ca7c90a58c	{"requestBody": {"isFeatured": false}}	::1	2026-08-19 05:21:34.7
96375f1a-be92-4508-b3ed-1f5a2bb93dda	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/cms/homepage-blocks/a06e38f3-6ed4-4214-8a46-691504197c47	cms	a06e38f3-6ed4-4214-8a46-691504197c47	{"requestBody": {"type": "how_it_works", "sortOrder": 2, "configJson": {"steps": [{"step": 1, "title": "Choose Your Destination", "description": "Browse destinations or tell our planner what you feel like."}, {"step": 2, "title": "Customize Your Trip", "description": "Swap hotels, add activities and set the pace with your expert."}, {"step": 3, "title": "Book With Expert Support", "description": "Approve the final itinerary, pay securely and get your vouchers."}, {"step": 4, "title": "Travel & Create Memories", "description": "Land with everything arranged and support a call away."}], "title": "Four steps from idea to boarding pass", "eyebrow": "How it works"}}}	::1	2026-08-19 05:23:23.619
1221e17c-f05c-4230-aff9-21d00e3176b2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/cms/homepage-blocks/8d30256b-33f2-4dc2-99b7-6b03f99e5506	cms	8d30256b-33f2-4dc2-99b7-6b03f99e5506	{"requestBody": {"type": "why_choose", "sortOrder": 0, "configJson": {"items": [{"icon": "luggage", "title": "Customized for You", "description": "100% customized tours made around you."}, {"icon": "headphones", "title": "Always by Your Side", "description": "24 X 7 customer support whenever you need us."}, {"icon": "shield-check", "title": "Trusted & Reliable", "description": "No scam, just the faith of lakhs of happy customers."}, {"icon": "handshake", "title": "Promise is Our Priority", "description": "What we promise, we deliver."}, {"icon": "hotel", "title": "Handpicked with Care", "description": "Hand selected properties and tours for the best experience."}, {"icon": "shield-plus", "title": "Worry Free Travel", "description": "Relax and enjoy, we take care of everything."}, {"icon": "user-round", "title": "Dedicated Expert Support", "description": "A dedicated expert before, during and after the trip for your feedback."}, {"icon": "settings", "title": "Our Service", "description": "Seamless, reliable and designed for your complete satisfaction."}, {"icon": "flag", "title": "Experts with You", "description": "Our experts will accompany large groups for a more comfortable journey."}], "title": "A travel company that stays on the line", "eyebrow": "Why Paxbook"}}}	::1	2026-08-19 05:23:36.204
a1e4f29a-5956-48a8-9c14-86436d3edf89	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.767
5412585d-4acc-4434-b15e-38074ddfe46a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"isFeatured": true}}	::1	2026-08-19 05:21:09.844
2cd6b5fb-4192-44f5-9118-8b92c998bd06	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"name": "Thailand", "slug": "thailand"}}	::1	2026-08-20 05:47:55.996
55163ee4-5f91-467a-a50a-d8e76682ed8c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"name": "Vietnam", "slug": "vietnam"}}	::1	2026-08-20 05:47:56.033
d4baa64a-36c2-48ed-9786-6b25bd29b729	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"name": "Malaysia", "slug": "malaysia"}}	::1	2026-08-20 05:47:56.063
220db135-6f9b-408f-8f2b-ddd3d92b928f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"name": "Japan", "slug": "japan"}}	::1	2026-08-20 05:47:56.095
94ee1581-bae4-4965-9e09-cc313a0459f8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"name": "Switzerland", "slug": "switzerland"}}	::1	2026-08-20 05:47:56.125
e12eaedc-5bca-4255-8eff-8b591a666e5f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-20 05:48:41.07
7e41fa54-7660-4290-a40d-9c01cc43c944	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"name": "Europe", "slug": "europe", "isActive": true, "countryId": "9cf6cf88-e6d2-4047-a349-1d394af954ac", "isFeatured": false, "categoryIds": [], "description": "Multi-city classics stitched together properly.", "heroImageKey": "d1b423a7-4b7d-4442-b597-eb37205fd02b-europe.jpg"}}	::1	2026-08-20 05:48:41.114
fd1368fc-e635-42ad-9adf-2cf9c81d3c18	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/uploads	uploads	unknown	{"requestBody": {}}	::1	2026-08-20 05:48:41.173
290bed4c-7f06-42ea-8261-857c86360f21	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	17ca6f62-feff-4c5a-bc36-02aba7ea9595	{"requestBody": {"slug": "europe-highlights-paris-swiss-rome", "title": "Europe Highlights: Paris, Swiss & Rome", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 234900, "inclusions": ["Flights", "Hotels", "Transfers"], "durationDays": 10, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 234900}], "destinationId": "b1763f26-0ed0-49a4-8490-80faafc6a155", "galleryImages": [{"sortOrder": 0, "storageKey": "909fcf41-f28f-4f35-a1e5-4f91b8655737-europe-gallery.jpg"}], "itineraryDays": [{"title": "Arrival in Europe", "dayNumber": 1, "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Europe", "dayNumber": 2, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 3, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 4, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 5, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 6, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 7, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 8, "description": "Guided sightseeing and local experiences."}, {"title": "Explore Europe", "dayNumber": 9, "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 10, "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 10, "routeMapPoints": []}}	::1	2026-08-20 05:48:41.341
ac17588b-e8d6-463a-80dc-0a51947c1aad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/packages/c0c8129c-ba80-4771-93f2-8da1edc56ee4	packages	c0c8129c-ba80-4771-93f2-8da1edc56ee4	{"requestBody": {}}	::1	2026-08-20 05:49:50.711
38b7499a-602d-439a-96c6-236f000e92cf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/packages/753e5a1a-15af-4801-9f08-8549b1cfd15b	packages	753e5a1a-15af-4801-9f08-8549b1cfd15b	{"requestBody": {}}	::1	2026-08-20 05:49:50.726
5c1672b9-49cf-475c-ac0b-fa28690600aa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	DELETE /api/v1/packages/49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	packages	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	{"requestBody": {}}	::1	2026-08-20 05:49:50.738
4bc10a1e-fa55-43c2-b898-46c7228b59ec	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/highlights	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"title": "Ubud rice terraces", "sortOrder": 0, "description": "Sunrise walk through Tegallalang followed by a jungle breakfast."}}	::1	2026-08-20 06:17:26.798
a7ae6ec0-d843-4aaa-a649-d25e7d2b409b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/highlights	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"title": "Nusa Penida day trip", "sortOrder": 1, "description": "Kelingking cliff, snorkelling stops and a speedboat crossing."}}	::1	2026-08-20 06:17:26.833
e7412f24-7f63-4e75-b903-7f80d857c79e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/highlights	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"title": "Uluwatu sunset", "sortOrder": 2, "description": "Cliff temple, Kecak fire dance and a seafood dinner on the sand."}}	::1	2026-08-20 06:17:26.851
538af7d9-46de-4e09-9d41-730304b825a8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/highlights	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"title": "Waterfall trail", "sortOrder": 3, "description": "Tegenungan and Tibumana with a local guide and private transfers."}}	::1	2026-08-20 06:17:26.864
37425d3d-95f7-4ee3-9016-a5fddc050044	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/activities	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"label": "Private pool villa stay", "sortOrder": 0}}	::1	2026-08-20 06:17:26.919
5c81edcf-34d7-4bc0-816f-95dfc8921949	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/activities	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"label": "Balinese spa evening", "sortOrder": 1}}	::1	2026-08-20 06:17:26.942
8a627f7d-bbd7-4940-8082-8349270f029e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/activities	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"label": "Waterbom day pass", "sortOrder": 2}}	::1	2026-08-20 06:17:26.976
81c8e515-5b35-4533-989a-d9420923246c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/activities	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"label": "Candlelight dinner", "sortOrder": 3}}	::1	2026-08-20 06:17:27.011
dff5eacf-7ffd-4595-a547-598dcdc7e525	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Ubud", "descriptor": "Boutique jungle-view stay", "starRating": 4}}	::1	2026-08-20 06:17:27.059
18a64d65-050f-493f-b443-02d482e62726	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Seminyak", "descriptor": "Beachfront resort", "starRating": 5}}	::1	2026-08-20 06:17:27.076
67ee8c96-7129-44b4-92b7-9e9be7273da3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Nusa Dua", "descriptor": "Private pool villa", "starRating": 5}}	::1	2026-08-20 06:17:27.107
bc64f517-db89-4325-b145-2701f53bcedd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"bestTimeToVisit": "April – October"}}	::1	2026-08-20 06:17:27.166
e1bada3e-ffe2-48ef-938b-ff48968ac1a0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	c9fd50a6-c828-4d26-8693-753db192d283	{"requestBody": {"answer": "Yes — short flights, friendly costs and English widely spoken make it an easy first trip abroad.", "entityId": "25534ce5-2b51-4471-9600-127036598b4b", "question": "Is Bali good for a first international trip?", "entityType": "destination"}}	::1	2026-08-20 06:17:27.2
218b3851-94f1-45ef-8826-0a9a6c04c660	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	cfe0f914-f02d-43ee-b2b2-787b66c2fbaa	{"requestBody": {"answer": "6-8 days lets you split time between Ubud's green interior and the south coast without feeling rushed.", "entityId": "25534ce5-2b51-4471-9600-127036598b4b", "question": "How many days is ideal?", "entityType": "destination"}}	::1	2026-08-20 06:17:27.22
b7fc0ef6-a769-4248-a87c-5e96cb5ed93e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	4dd6a70e-a447-4545-a6a9-4d277781dbf2	{"requestBody": {"answer": "Every itinerary is a starting point — your travel expert reshapes the pace, stays and activities around what you want.", "entityId": "25534ce5-2b51-4471-9600-127036598b4b", "question": "Can the itinerary be customised?", "entityType": "destination"}}	::1	2026-08-20 06:17:27.236
4edf30be-92a5-4cac-863d-3a3e96864bbe	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/4b1243ae-b604-4795-9954-6e50548a2be9	packages	4b1243ae-b604-4795-9954-6e50548a2be9	{"requestBody": {"slug": "goa-long-weekend", "title": "Goa Long Weekend", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 16900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 3, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 16900}], "destinationId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "galleryImages": [{"sortOrder": 0, "storageKey": "70af56e4-0ce1-4ddc-9d43-f14685c273d8-goa-DegD7h4J.jpg"}], "itineraryDays": [{"title": "Arrival in Goa", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Goa", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 3, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 2, "routeMapPoints": []}}	::1	2026-08-20 06:25:58.755
9ecb77eb-f0bc-4ba9-af44-0b90e3b76062	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/cded3556-e733-41ce-982a-9cce008c17a2	packages	cded3556-e733-41ce-982a-9cce008c17a2	{"requestBody": {"slug": "rajasthan-royal-trail", "title": "Rajasthan Royal Trail", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 32900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 32900}], "destinationId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "galleryImages": [{"sortOrder": 0, "storageKey": "a7b18a12-4bdb-4263-9453-c7afa7958b64-rajasthan-oD07PIG2.jpg"}], "itineraryDays": [{"title": "Arrival in Rajasthan", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Rajasthan", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Rajasthan", "dayNumber": 5, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-20 06:25:58.878
8bb87bf7-a269-441b-9cb6-7ff01f9ccc1f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/4af9d23d-1fdd-46d9-94ea-e40837863259	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Tourist visa", "isVisaFree": false, "processingTime": "5 – 7 working days", "requiredDocuments": ["Passport copy", "Photograph", "Bank statement", "Travel itinerary"]}}	::1	2026-08-20 07:45:31.649
e1d13f70-e99f-447b-a205-e2385a8df5f3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/9cf6cf88-e6d2-4047-a349-1d394af954ac	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Schengen short-stay visa", "isVisaFree": false, "processingTime": "15 – 25 working days", "requiredDocuments": ["Application form", "Bank statements (6 months)", "ITR", "Travel insurance", "Confirmed bookings"]}}	::1	2026-08-20 07:45:31.67
ecf4af20-727f-4485-8580-95305a34066d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/f989fedd-4be6-4adf-83ac-c794cf3a4831	packages	f989fedd-4be6-4adf-83ac-c794cf3a4831	{"requestBody": {"slug": "kerala-backwater-serenity", "title": "Kerala Backwater Serenity", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 26900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 26900}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [{"sortOrder": 0, "storageKey": "6ecdfd05-8c45-426d-9dcb-a86da8458fb1-kerala-BRDUcEbv.jpg"}], "itineraryDays": [{"title": "Arrival in Kerala", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Kerala", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Kerala", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Kerala", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:58.962
b6b361c2-0432-4016-b2dc-2fbf08c909b6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/518aee17-5f2f-4d00-ba85-2095083bc6a9	packages	518aee17-5f2f-4d00-ba85-2095083bc6a9	{"requestBody": {"slug": "interlaken-alpine-adventure", "title": "Switzerland Alpine Classic", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 189900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 189900}], "destinationId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "galleryImages": [{"sortOrder": 0, "storageKey": "5872958f-c810-47d6-947f-533d6335f919-switzerland-D5Q0EHJx.jpg"}], "itineraryDays": [{"title": "Arrival in Interlaken", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Interlaken", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Interlaken", "dayNumber": 5, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.037
6ac89193-d4e5-4e09-aaad-8c5bf3306fe1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/9fb09db3-7da0-4e3d-aecd-42b2201c2d60	packages	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	{"requestBody": {"slug": "singapore-family-discovery", "title": "Singapore + Malaysia Combo", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 78900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 78900}], "destinationId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "galleryImages": [{"sortOrder": 0, "storageKey": "44b0b38f-e12c-4bda-8b52-11f2b76c0a8b-singapore-D61jditK.jpg"}], "itineraryDays": [{"title": "Arrival in Singapore", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Singapore", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Singapore", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Singapore", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.124
352e690f-37b4-4c0e-b27e-0415b2b7141c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/1c39245e-c86f-41c1-b09e-26b201c99cc1	packages	1c39245e-c86f-41c1-b09e-26b201c99cc1	{"requestBody": {"slug": "bangkok-street-food-temples-trail", "title": "Thailand Island Hopper", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 44900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 44900}], "destinationId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "galleryImages": [{"sortOrder": 0, "storageKey": "92aeaf03-e553-4cdf-811b-ba6941d510ce-thailand-C2yi6qi_.jpg"}], "itineraryDays": [{"title": "Arrival in Bangkok", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bangkok", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bangkok", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 4, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 3, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.198
898ea15d-2993-42f2-b14a-cd0dbbcbf0af	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"bestTimeToVisit": "November – April"}}	::1	2026-08-21 06:48:45.836
1633d671-cc89-464d-91e7-7efd44de6acc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/highlights	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"title": "Overwater spa", "sortOrder": 3, "description": "Couples treatment with a glass floor over the lagoon."}}	::1	2026-08-21 06:48:46.267
fcc6d825-4fc2-4df5-b648-e20fb4fe60ad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/activities	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"label": "Seaplane transfer", "sortOrder": 0}}	::1	2026-08-21 06:48:46.286
2beb6af4-34cb-43bf-8477-ab38c1b9da25	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/fbce3a52-8e3d-4629-a97b-d27108ee670e	packages	fbce3a52-8e3d-4629-a97b-d27108ee670e	{"requestBody": {"slug": "dubai-city-desert-explorer", "title": "Dubai Family Holiday", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 61900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 61900}], "destinationId": "2824d140-2702-4a58-a0aa-6030c8134362", "galleryImages": [{"sortOrder": 0, "storageKey": "734068ad-a5cb-463b-a597-19165acfae94-dubai-DRCuuGaX.jpg"}], "itineraryDays": [{"title": "Arrival in Dubai", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Dubai", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Dubai", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Dubai", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.277
4d66e124-83db-4f1b-9d6e-2de9faee0207	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/5615d775-f89b-470f-8f4a-f8a38a881bd2	packages	5615d775-f89b-470f-8f4a-f8a38a881bd2	{"requestBody": {"slug": "maldives-overwater-villa-retreat", "title": "Maldives Water Villa Retreat", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 118900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 118900}], "destinationId": "f57f1a08-d092-407c-bc01-962f7328974f", "galleryImages": [{"sortOrder": 0, "storageKey": "26209972-e947-4a22-b170-56fda5b1a9b8-maldives-DgCIoG22.jpg"}], "itineraryDays": [{"title": "Arrival in Maldives", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Maldives", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Maldives", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Maldives", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 5, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.349
4f5538ba-0726-4ec6-ae71-27bb019f3dd8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/4e7f5e85-4690-498d-8335-39af4921034b	packages	4e7f5e85-4690-498d-8335-39af4921034b	{"requestBody": {"slug": "bali-honeymoon-escape", "title": "Bali Honeymoon Escape", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 58900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 58900}], "destinationId": "25534ce5-2b51-4471-9600-127036598b4b", "galleryImages": [{"sortOrder": 0, "storageKey": "9f33283f-b3d3-47dc-8b4c-1992e768476d-bali-C-ZvmxxP.jpg"}], "itineraryDays": [{"title": "Arrival in Bali", "dayNumber": 1, "activities": [], "description": "Airport pickup and check-in. Evening free to settle in."}, {"title": "Explore Bali", "dayNumber": 2, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 3, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 4, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Explore Bali", "dayNumber": 5, "activities": [], "description": "Guided sightseeing and local experiences."}, {"title": "Departure", "dayNumber": 6, "activities": [], "description": "Check-out and transfer to the airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.441
082121d1-3168-4135-8ba9-6cbc44dae690	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/82e2fc31-77dc-4c33-b1ba-202048ac14c2	packages	82e2fc31-77dc-4c33-b1ba-202048ac14c2	{"requestBody": {"slug": "shimla-manali-adventure-trail", "title": "Shimla Manali Adventure Trail", "hotels": [{"cityName": "Shimla", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Manali", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 3, "checkOutDay": 6}], "status": "PUBLISHED", "flights": [], "basePrice": 19999, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [], "destinationId": "5849cc1d-988c-4310-b48d-7027c576718c", "galleryImages": [{"sortOrder": 0, "storageKey": "484fc1c1-5298-4b9c-aa97-0c7a7561a92b-shimla-manali-adventure-trail.jpg"}], "itineraryDays": [{"title": "Arrive Shimla", "dayNumber": 1, "activities": [{"name": "Mall Road walk", "isOptional": false}]}, {"title": "Kufri excursion", "dayNumber": 2, "activities": [{"name": "Paragliding", "isOptional": true}]}, {"title": "Drive to Manali", "dayNumber": 3, "activities": [{"name": "River rafting", "isOptional": true}]}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.524
af4ba03f-37d8-4661-be35-0019a6e519d7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/highlights	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"title": "House reef snorkelling", "sortOrder": 0, "description": "Step off your villa deck into a living coral garden."}}	::1	2026-08-21 06:48:46.215
7326c1c4-3732-4cbc-ba68-fd4a65eb7253	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/highlights	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"title": "Sandbank picnic", "sortOrder": 1, "description": "Private boat drop to an empty sandbank with a packed lunch."}}	::1	2026-08-21 06:48:46.238
89439d1b-7fc9-4f4b-9927-e5a47f76135d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/highlights	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"title": "Sunset dolphin cruise", "sortOrder": 2, "description": "An hour on the water as pods cross the atoll."}}	::1	2026-08-21 06:48:46.252
5b47579c-26e5-41b0-9a3a-4cc2f4340aca	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/5a8810cd-87b6-4d87-8434-a5e84705284b	packages	5a8810cd-87b6-4d87-8434-a5e84705284b	{"requestBody": {"slug": "kerala-backwaters-munnar-family-escape", "title": "Kerala Backwaters & Munnar Family Escape", "hotels": [{"cityName": "Munnar", "mealPlan": "Breakfast", "roomType": "Deluxe", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Alleppey", "mealPlan": "All meals", "roomType": "Houseboat", "checkInDay": 3, "checkOutDay": 4}], "status": "PUBLISHED", "flights": [], "basePrice": 28500, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 28500}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [{"sortOrder": 0, "storageKey": "80c8b0de-9909-48f4-8b8c-a8f96a090776-kerala-backwaters-munnar-family-escape.jpg"}], "itineraryDays": [{"title": "Arrive Kochi, drive to Munnar", "dayNumber": 1, "activities": [{"name": "Tea garden visit", "isOptional": false}]}, {"title": "Munnar sightseeing", "dayNumber": 2, "activities": [{"name": "Eravikulam National Park", "isOptional": true}]}, {"title": "Drive to Alleppey, houseboat check-in", "dayNumber": 3, "activities": [{"name": "Backwater cruise", "isOptional": false}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.61
b9b0455d-e363-4c83-a3ac-0ad608f282d7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	packages	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	{"requestBody": {"slug": "phuket-honeymoon-escape", "title": "Phuket Honeymoon Escape (Updated)", "hotels": [{"cityName": "Phuket", "checkInDay": 1, "checkOutDay": 5}], "status": "PUBLISHED", "flights": [], "basePrice": 52000, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [], "destinationId": "bdd09d56-d5b9-4934-81f4-66ca7c90a58c", "galleryImages": [{"sortOrder": 0, "storageKey": "acdc3db8-3aed-459e-892c-1efce34a72d9-phuket-honeymoon-escape.jpg"}], "itineraryDays": [{"title": "Arrival day", "dayNumber": 1, "activities": [{"name": "Snorkeling trip", "isOptional": false}]}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-20 06:25:59.664
5eb6c51f-65b4-4cac-b080-4f0669edaf0e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/6dfc27c2-1f08-46fb-b3c9-5fc166cbcbde	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Tourist e-Visa", "isVisaFree": false, "processingTime": "3 – 5 working days", "requiredDocuments": ["Passport with 6 months validity", "Passport size photograph", "Confirmed flight & hotel booking"]}}	::1	2026-08-20 07:45:31.447
99327c56-fe8a-4a50-84cc-4569f09cbc94	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Visa exemption for tourists", "isVisaFree": true, "processingTime": "On arrival", "requiredDocuments": ["Passport with 6 months validity", "Return ticket", "Proof of accommodation"]}}	::1	2026-08-20 07:45:31.47
f099fe0b-87ac-4153-a960-69b98c201981	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/41f88819-174f-4932-a283-11569951c20a	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Tourist e-Visa", "isVisaFree": false, "processingTime": "4 – 7 working days", "requiredDocuments": ["Passport copy", "Photograph as per spec", "Bank statement", "Confirmed itinerary"]}}	::1	2026-08-20 07:45:31.496
3b7cad36-8882-4150-b03f-ce0eff085e3b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/c6d88296-0db9-401c-a25d-08694f5ff6b2	cms	unknown	{"requestBody": {"visaFee": 0, "currency": "INR", "visaType": "Free visa on arrival", "isVisaFree": true, "processingTime": "On arrival", "requiredDocuments": ["Passport with 1 month validity", "Confirmed resort booking", "Return ticket"]}}	::1	2026-08-20 07:45:31.522
bcda2946-d189-47e9-812d-14980cdc0ad4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/1f75f43e-cbe1-41f0-8cf0-3cd080586511	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "e-Visa", "isVisaFree": false, "processingTime": "3 – 5 working days", "requiredDocuments": ["Passport scan", "Digital photograph", "Travel dates & entry port"]}}	::1	2026-08-20 07:45:31.537
126e7145-d51f-4556-be55-d47ba6dc3d23	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/d64f23b4-8684-41e0-b0e3-739bf0c30a7a	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Schengen short-stay visa", "isVisaFree": false, "processingTime": "15 – 25 working days", "requiredDocuments": ["Application form", "Bank statements (6 months)", "ITR", "Travel insurance", "Confirmed bookings"]}}	::1	2026-08-20 07:45:31.551
5ba1d4bc-6cbf-4535-9d24-afe8cf961012	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/260f1c6c-0987-4101-be33-00795c9e95ed	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "ETA", "isVisaFree": true, "processingTime": "1 – 3 working days", "requiredDocuments": ["Passport copy", "Return ticket", "Accommodation details"]}}	::1	2026-08-20 07:45:31.569
23c825d9-e038-4b5d-baaa-20834fc9e8a7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/2b1ac0d6-fdfe-4e8c-9076-0fc317a82301	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Entry permit for Indian nationals", "isVisaFree": true, "processingTime": "2 – 4 working days", "requiredDocuments": ["Passport or voter ID", "Photograph", "Hotel & guide confirmation"]}}	::1	2026-08-20 07:45:31.586
3a484fc4-1044-4534-b879-c298498852d3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/3a0819ff-2ceb-49b9-9605-2de701abd818	cms	unknown	{"requestBody": {"visaFee": 0, "currency": "INR", "visaType": "Visa on arrival", "isVisaFree": true, "processingTime": "On arrival", "requiredDocuments": ["Passport with 6 months validity", "Return ticket", "Proof of accommodation"]}}	::1	2026-08-20 07:45:31.604
20551ee7-0fe3-4608-854d-117cd436b762	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/f62c9849-c9ed-4836-a657-db755502a035	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Visa-free entry window", "isVisaFree": true, "processingTime": "On arrival", "requiredDocuments": ["Passport with 6 months validity", "Return ticket", "Proof of funds"]}}	::1	2026-08-20 07:45:31.616
cd91dadb-7d86-4eb7-bfd0-e3ecc7fc62a5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PUT /api/v1/cms/visa-info/1c5c825e-ba41-4bf9-a15b-caa9b04f305d	cms	unknown	{"requestBody": {"currency": "INR", "visaType": "Visa on arrival", "isVisaFree": false, "processingTime": "On arrival", "requiredDocuments": ["Passport with 6 months validity", "Return ticket"]}}	::1	2026-08-20 07:45:31.632
91b2fae4-4cd2-4615-805a-a7479b9f4199	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/activities	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"label": "Floating breakfast", "sortOrder": 1}}	::1	2026-08-21 06:48:46.301
209f2ce8-da38-4954-ad37-9d339224150a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/activities	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"label": "Night fishing", "sortOrder": 2}}	::1	2026-08-21 06:48:46.319
e0107087-060d-4c23-a2e8-f920fc0800d1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/activities	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"label": "Scuba discovery dive", "sortOrder": 3}}	::1	2026-08-21 06:48:46.334
199ad0fc-7cba-4a2d-b66c-e4cc1161918e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/hotel-suggestions	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"area": "South Malé Atoll", "name": "Lagoon Water Villa Resort", "sortOrder": 0, "starRating": 5}}	::1	2026-08-21 06:48:46.35
34958018-67b1-41e9-8a60-e26328253f8f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/hotel-suggestions	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"area": "North Malé Atoll", "name": "Reef Beach Villas", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:46.364
127862f7-568c-401c-b6a3-a5441d0d6fce	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f57f1a08-d092-407c-bc01-962f7328974f/hotel-suggestions	destinations	f57f1a08-d092-407c-bc01-962f7328974f	{"requestBody": {"area": "Baa Atoll", "name": "Atoll Premium Retreat", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:46.379
2e40841c-4233-4194-9fe1-ef66f7063d7b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"bestTimeToVisit": "November – March"}}	::1	2026-08-21 06:48:46.406
499e9f0b-ad50-4a2e-9851-2bfc3b50d86a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/highlights	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"title": "Burj Khalifa levels 124/125", "sortOrder": 0, "description": "Timed-entry tickets, ideally at sunset."}}	::1	2026-08-21 06:48:46.45
2c19c6d8-2f63-4a59-b7c7-9722a819e6cd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/highlights	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"title": "Desert safari", "sortOrder": 1, "description": "Dune drive, camel ride and a dinner camp under the stars."}}	::1	2026-08-21 06:48:46.474
812ba83a-89ec-4e9d-a442-a82f58401b1a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/highlights	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"title": "Dhow cruise, Dubai Marina", "sortOrder": 2, "description": "Buffet dinner with the skyline lit up."}}	::1	2026-08-21 06:48:46.488
5aebed91-1b9f-498f-89ef-fcf9795d87d7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/highlights	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"title": "Museum of the Future", "sortOrder": 3, "description": "One of the city's best indoor mornings."}}	::1	2026-08-21 06:48:46.498
09122067-16a3-4c00-96db-9637e343c38c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/activities	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"label": "Desert safari with BBQ", "sortOrder": 0}}	::1	2026-08-21 06:48:46.52
5ce3fb20-7c9f-4b3d-aa90-2d4c6c1ec6eb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/activities	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"label": "Aquaventure waterpark", "sortOrder": 1}}	::1	2026-08-21 06:48:46.532
7470c206-a869-4849-8b36-e2a5b4c2bea9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/activities	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"label": "Abu Dhabi day trip", "sortOrder": 2}}	::1	2026-08-21 06:48:46.544
fd218fc4-dc47-4d3f-a9b8-80b5861ed1c3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/activities	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"label": "Dubai Frame", "sortOrder": 3}}	::1	2026-08-21 06:48:46.558
0ec4a65b-9f36-4401-90b3-cae7750c48cf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/hotel-suggestions	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"area": "Dubai Marina", "name": "Marina Skyline Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:46.573
b23dbb8b-6309-4b9d-b87b-84c6f8971ea9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/hotel-suggestions	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"area": "Downtown", "name": "Downtown Fountain View", "sortOrder": 1, "starRating": 5}}	::1	2026-08-21 06:48:46.584
1b1b16b4-2fcc-4690-bd7c-6c49b2bc21a4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2824d140-2702-4a58-a0aa-6030c8134362/hotel-suggestions	destinations	2824d140-2702-4a58-a0aa-6030c8134362	{"requestBody": {"area": "Palm Jumeirah", "name": "Palm Beach Resort", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:46.6
22dd42b7-7a15-42e7-a037-d4e77a78dd90	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"bestTimeToVisit": "November – March"}}	::1	2026-08-21 06:48:46.623
e21b2313-53dc-4e45-bc3a-3e18ad5f4706	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/highlights	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"title": "Phi Phi islands by speedboat", "sortOrder": 0, "description": "Maya Bay viewpoint, snorkel stops and a beach lunch."}}	::1	2026-08-21 06:48:46.675
9d38a981-5398-4fe1-91c9-1c7f9d45023d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/highlights	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"title": "James Bond island, Phang Nga", "sortOrder": 1, "description": "Sea canoeing through limestone caves."}}	::1	2026-08-21 06:48:46.69
db1e7201-5cd0-4490-bec0-7099c9d5d066	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/highlights	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"title": "Bangkok temples", "sortOrder": 2, "description": "Grand Palace and Wat Arun with a river ferry crossing."}}	::1	2026-08-21 06:48:46.708
45cacfa8-f7bb-46c3-8b3e-a1085fc52452	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/highlights	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"title": "Floating market morning", "sortOrder": 3, "description": "Damnoen Saduak with a longtail boat ride."}}	::1	2026-08-21 06:48:46.731
223104c3-3b79-4d69-b0a1-c2aff06655ad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/activities	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"label": "Speedboat island tour", "sortOrder": 0}}	::1	2026-08-21 06:48:46.749
8174637a-3ee1-47b7-85c7-840a42f0beaa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/activities	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"label": "Thai cooking class", "sortOrder": 1}}	::1	2026-08-21 06:48:46.762
0367d366-c065-4776-b612-fd45cc9673b8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/activities	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"label": "Elephant sanctuary visit", "sortOrder": 2}}	::1	2026-08-21 06:48:46.784
d5198186-d0c7-4b77-a472-b74e991a4dc8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/activities	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"label": "Chao Phraya dinner cruise", "sortOrder": 3}}	::1	2026-08-21 06:48:46.8
cea673cd-f1d4-4bb3-b766-09857752b87a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/hotel-suggestions	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"area": "Phuket", "name": "Patong Bay Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:46.816
764fb6ce-d9d2-450e-bca7-5c94164d8919	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/hotel-suggestions	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"area": "Krabi", "name": "Krabi Cliffside Resort", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:46.83
b7e0d6ab-20ca-4c97-86b8-f837750eee64	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/eae20d80-da05-4a8c-8727-1886bcc7cf52/hotel-suggestions	destinations	eae20d80-da05-4a8c-8727-1886bcc7cf52	{"requestBody": {"area": "Bangkok", "name": "Sukhumvit City Hotel", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:46.846
d434722c-5fe9-4442-841f-5e7f7716fa0f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"bestTimeToVisit": "Year round"}}	::1	2026-08-21 06:48:46.865
1d419352-55e5-4f13-9a73-38320401db1b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/highlights	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"title": "Universal Studios Sentosa", "sortOrder": 0, "description": "Full-day park with express options."}}	::1	2026-08-21 06:48:46.902
a2923fd4-d64b-4046-bb47-1d2091ac7c2d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/highlights	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"title": "Gardens by the Bay", "sortOrder": 1, "description": "Cloud Forest, Flower Dome and the evening light show."}}	::1	2026-08-21 06:48:46.928
297d9a96-d4ba-421c-8966-a02d2b29294e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/highlights	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"title": "Singapore Zoo & River Wonders", "sortOrder": 2, "description": "Best done as a half-day morning."}}	::1	2026-08-21 06:48:46.938
ed8dbbf8-fde2-43f5-bd91-2606b00b3121	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/highlights	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"title": "Marina Bay Sands SkyPark", "sortOrder": 3, "description": "City panorama at dusk."}}	::1	2026-08-21 06:48:46.949
bf48dbeb-c3c1-4967-917b-4116babbe991	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/activities	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"label": "Universal Studios", "sortOrder": 0}}	::1	2026-08-21 06:48:46.961
d162518f-30c8-4e93-9790-8961cf3f1887	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/activities	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"label": "Night Safari", "sortOrder": 1}}	::1	2026-08-21 06:48:46.978
62861754-c793-479d-b3a3-f7975fad8f4d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/activities	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"label": "Cable car to Sentosa", "sortOrder": 2}}	::1	2026-08-21 06:48:46.994
e8d41443-dbd1-49f7-b004-39de2fc57b49	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/activities	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"label": "Hop-on hop-off pass", "sortOrder": 3}}	::1	2026-08-21 06:48:47.007
61d30875-219b-4bcd-a23f-d186ffd0415b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/hotel-suggestions	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"area": "Clarke Quay", "name": "Clarke Quay Riverside", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:47.03
a8582f11-b8df-4541-b57e-5470c02416d6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/hotel-suggestions	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"area": "Orchard", "name": "Orchard Central Hotel", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:47.046
0c136627-c6a8-4fce-a409-712ee4e58037	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f0826aab-9c60-41d2-82e2-dd2f9bff7902/hotel-suggestions	destinations	f0826aab-9c60-41d2-82e2-dd2f9bff7902	{"requestBody": {"area": "Sentosa", "name": "Sentosa Island Resort", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:47.056
2791aca0-ca29-4d92-b966-03cc0b709f9e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"bestTimeToVisit": "October – April"}}	::1	2026-08-21 06:48:47.086
f84f2854-b544-4500-b348-84c63dbfc5eb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/highlights	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"title": "Ha Long Bay overnight cruise", "sortOrder": 0, "description": "Cabin on the water, kayaking and a cave stop."}}	::1	2026-08-21 06:48:47.118
aff984cd-19d7-4bc4-9644-568a22008980	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/highlights	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"title": "Hoi An old town", "sortOrder": 1, "description": "Lantern evening, tailoring and a riverside dinner."}}	::1	2026-08-21 06:48:47.129
2b9bf062-903d-4231-bb1c-8e5b3b232e35	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/highlights	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"title": "Cu Chi tunnels", "sortOrder": 2, "description": "Half-day history trip out of Ho Chi Minh City."}}	::1	2026-08-21 06:48:47.145
a7848d2c-8cd6-4d33-94a4-e7d1c04f13ec	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/highlights	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"title": "Ba Na Hills", "sortOrder": 3, "description": "Cable car to the Golden Bridge."}}	::1	2026-08-21 06:48:47.163
fd70a312-cec7-4a63-902d-56d95b3d79ee	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/activities	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"label": "Overnight cruise cabin", "sortOrder": 0}}	::1	2026-08-21 06:48:47.173
75b8aaa1-70c6-4a65-b279-ccea86c6021a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/activities	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"label": "Street food walk", "sortOrder": 1}}	::1	2026-08-21 06:48:47.192
38d6e64b-ec7e-45e0-bab1-ddbf00895e15	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/activities	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"label": "Golden Bridge visit", "sortOrder": 2}}	::1	2026-08-21 06:48:47.217
ff8cdc75-91bc-41cc-b523-7142c2c0f411	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/activities	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"label": "Mekong delta boat", "sortOrder": 3}}	::1	2026-08-21 06:48:47.232
897ceb3c-a59f-4b60-bc62-2586fc877a50	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/hotel-suggestions	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"area": "Hanoi", "name": "Hanoi Old Quarter Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:47.249
ae5ad98b-7205-401e-a352-d9c648b997dc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/hotel-suggestions	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"area": "Da Nang", "name": "Da Nang Beachfront", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:47.262
f384757e-c761-4f69-a774-efcfb2b5ddcd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/d487d421-1b6a-47af-aa02-a06fd7a09dfc/hotel-suggestions	destinations	d487d421-1b6a-47af-aa02-a06fd7a09dfc	{"requestBody": {"area": "Ha Long Bay", "name": "Ha Long Deluxe Cruise", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:47.282
bb71d281-4e32-4ae8-8b2d-3de155722272	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"bestTimeToVisit": "December – April"}}	::1	2026-08-21 06:48:47.308
6b3c6a95-8093-4604-ab49-c140105eda29	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/highlights	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"title": "Petronas Towers", "sortOrder": 0, "description": "Skybridge tickets and the KLCC park fountain show."}}	::1	2026-08-21 06:48:47.385
a40ce4d2-472c-461e-9ce2-58b2645892b8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/highlights	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"title": "Langkawi Sky Bridge", "sortOrder": 1, "description": "Cable car through rainforest to the curved bridge."}}	::1	2026-08-21 06:48:47.422
70cc7a62-e94b-490d-8f3d-890096a9fc7a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/highlights	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"title": "Island hopping, Langkawi", "sortOrder": 2, "description": "Dayang Bunting lake and eagle feeding."}}	::1	2026-08-21 06:48:47.447
30658bf9-fb0b-4aa3-aed4-34bf491d99e5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/highlights	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"title": "Batu Caves", "sortOrder": 3, "description": "Colourful steps and a short morning trip from KL."}}	::1	2026-08-21 06:48:47.461
c5d76d77-9449-4b95-80ff-e0f24239cbed	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/activities	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"label": "Sky Bridge cable car", "sortOrder": 0}}	::1	2026-08-21 06:48:47.474
f1a09afc-39e9-4ee3-9879-79b7e7dccff4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/activities	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"label": "Island hopping boat", "sortOrder": 1}}	::1	2026-08-21 06:48:47.488
2db6f0dc-d575-4b93-8b93-1e94f3f2d99d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/activities	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"label": "Sunset cruise", "sortOrder": 2}}	::1	2026-08-21 06:48:47.511
a5b3b11a-2c1f-4305-85e9-459434712acd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/activities	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"label": "KL city tour", "sortOrder": 3}}	::1	2026-08-21 06:48:47.529
f419c7bf-20b7-496f-926c-a5f418a3982e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/hotel-suggestions	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"area": "Kuala Lumpur", "name": "Bukit Bintang City Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:47.548
96b0af58-5296-4df5-8d77-7c903d43a444	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/hotel-suggestions	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"area": "Langkawi", "name": "Pantai Cenang Resort", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:47.559
0b9d0134-d84a-4273-92b2-f5aaf72e5461	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/2c239102-080c-4345-aa90-6f25024979fc/hotel-suggestions	destinations	2c239102-080c-4345-aa90-6f25024979fc	{"requestBody": {"area": "Langkawi", "name": "Langkawi Cliff Villas", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:47.572
62a839a2-d0cc-4267-89ab-a62608d157b3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"bestTimeToVisit": "March – May, October – November"}}	::1	2026-08-21 06:48:47.595
852ee54a-ce78-4eec-ad0d-d1d89eeb6a91	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/highlights	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"title": "Kyoto temple trail", "sortOrder": 0, "description": "Fushimi Inari at dawn, Arashiyama bamboo by mid-morning."}}	::1	2026-08-21 06:48:47.647
49db0cf0-c7e3-4f8a-898a-be689e532f77	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/highlights	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"title": "Shinkansen to Osaka", "sortOrder": 1, "description": "Reserved seats and a food crawl in Dotonbori."}}	::1	2026-08-21 06:48:47.661
abe0b3f1-2a2b-49ca-9eb2-6a9c726fd94f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/highlights	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"title": "Mount Fuji day", "sortOrder": 2, "description": "Lake Kawaguchi views and a ropeway ride."}}	::1	2026-08-21 06:48:47.672
c78486fb-4d3d-4b5a-b54d-f38ed137152d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/highlights	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"title": "Tokyo neighbourhoods", "sortOrder": 3, "description": "Shibuya, Asakusa and teamLab."}}	::1	2026-08-21 06:48:47.688
5f8889c8-372d-48eb-9011-e6c9ccd2291c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/activities	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"label": "JR rail pass", "sortOrder": 0}}	::1	2026-08-21 06:48:47.701
4cd02032-4769-47e9-9987-3a4f8255f873	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/activities	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"label": "teamLab tickets", "sortOrder": 1}}	::1	2026-08-21 06:48:47.712
d1379faa-17eb-4e0e-b505-456809cb0331	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/activities	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"label": "Ryokan onsen night", "sortOrder": 2}}	::1	2026-08-21 06:48:47.725
ffba70fe-3386-499c-b64b-6c162c48fd8d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/activities	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"label": "Sumo or kabuki evening", "sortOrder": 3}}	::1	2026-08-21 06:48:47.74
b731a917-e29b-4cd2-9412-38d33e1f4e4c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/hotel-suggestions	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"area": "Tokyo", "name": "Shinjuku Tower Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:47.763
5702a1bf-7a29-41b8-8e00-89888814692d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/hotel-suggestions	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"area": "Kyoto", "name": "Kyoto Machiya Stay", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:47.78
8cf8cd4b-55d7-42b0-bb2b-94cd9699fd5b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48/hotel-suggestions	destinations	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	{"requestBody": {"area": "Hakone", "name": "Hakone Onsen Ryokan", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:47.794
ff62aa91-9ffd-49a4-8126-fcf3c2e34ec9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"bestTimeToVisit": "May – September, December for snow"}}	::1	2026-08-21 06:48:47.811
23d242fb-3fb9-423e-ab1c-c6ff4b91eb3f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/activities	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"label": "Jungfraujoch excursion", "sortOrder": 1}}	::1	2026-08-21 06:48:47.917
5ca53b56-2c19-493f-b069-d1cf8b209a9d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/highlights	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"title": "Jungfraujoch", "sortOrder": 0, "description": "Top of Europe by cogwheel train."}}	::1	2026-08-21 06:48:47.847
4512cd3e-c51a-44b1-b415-067fa8cce0d3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/highlights	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"title": "Lake Lucerne cruise", "sortOrder": 1, "description": "Boat plus Mount Pilatus golden round trip."}}	::1	2026-08-21 06:48:47.861
602d1c64-828d-4bdd-b4c7-d4355c98f461	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/highlights	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"title": "Interlaken paragliding", "sortOrder": 2, "description": "Twenty minutes over the twin lakes."}}	::1	2026-08-21 06:48:47.876
e5eb476e-2d4c-4aca-a24b-9b4a514b2b18	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/highlights	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"title": "Zermatt & Matterhorn", "sortOrder": 3, "description": "Gornergrat railway on a clear morning."}}	::1	2026-08-21 06:48:47.894
c9f0b531-7c2b-4772-9a64-f9e97a2fa447	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/activities	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"label": "Swiss Travel Pass", "sortOrder": 0}}	::1	2026-08-21 06:48:47.909
aaaa6ae7-c7d9-4e37-911e-ab755bda6755	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/highlights	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"title": "Udaipur lake palaces", "sortOrder": 0, "description": "City Palace, boat ride and a rooftop dinner."}}	::1	2026-08-21 06:48:48.278
c0d384df-dd81-410a-946d-77cdab37f0a5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/highlights	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"title": "Jaisalmer desert camp", "sortOrder": 1, "description": "Dune sunset, folk music and a night under the stars."}}	::1	2026-08-21 06:48:48.289
a04c5e68-d0ae-4813-bf5c-a4617f831ab5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/highlights	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"title": "Mehrangarh Fort", "sortOrder": 2, "description": "Jodhpur's blue city from the ramparts."}}	::1	2026-08-21 06:48:48.314
efaf8316-b4c3-472f-9c09-1c42acc681d6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/highlights	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"title": "Amber Fort, Jaipur", "sortOrder": 3, "description": "Morning visit before the crowds build."}}	::1	2026-08-21 06:48:48.339
14b789c8-45cd-4425-b921-6a74372599c0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/activities	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"label": "Desert camp night", "sortOrder": 0}}	::1	2026-08-21 06:48:48.362
ff185f36-c991-402e-835b-32c459878644	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/activities	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"label": "Vintage car city tour", "sortOrder": 1}}	::1	2026-08-21 06:48:48.377
19a71389-819e-43a7-af32-a2533384a764	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/activities	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"label": "Cooking session", "sortOrder": 2}}	::1	2026-08-21 06:48:48.395
c40f7f8b-53c7-4244-900d-41c9b0a87779	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/activities	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"label": "Folk dance evening", "sortOrder": 3}}	::1	2026-08-21 06:48:48.414
d9dc407b-2447-443d-ba7e-81f8bfe48529	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/hotel-suggestions	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"area": "Udaipur", "name": "Udaipur Lakeview Haveli", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:48.429
0f241161-2306-41a2-b914-944eac502dba	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/hotel-suggestions	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"area": "Sam Dunes", "name": "Jaisalmer Luxury Camp", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:48.463
1eee52a2-060f-491b-bd2b-508f991ef611	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b/hotel-suggestions	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"area": "Jaipur", "name": "Jaipur Palace Hotel", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:48.486
9e5a5698-d3f9-4e35-8da3-24d10a6fcd11	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"bestTimeToVisit": "September – March"}}	::1	2026-08-21 06:48:48.52
03ea6c1b-4cd4-4d8c-8075-de1b5cfcb566	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/activities	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"label": "Houseboat night", "sortOrder": 0}}	::1	2026-08-21 06:48:48.741
7703664f-f745-4907-a6c1-12053119aeff	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/activities	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"label": "Ayurvedic massage", "sortOrder": 1}}	::1	2026-08-21 06:48:48.789
d7587305-145e-481e-a1a6-495036674d73	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/activities	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"label": "Spice plantation tour", "sortOrder": 2}}	::1	2026-08-21 06:48:48.797
6b8458ad-b211-42e7-ac8e-6702e7b1e09f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/activities	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"label": "Paragliding", "sortOrder": 2}}	::1	2026-08-21 06:48:47.937
1d20c0d1-9734-456c-8590-cfe47299ed2f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/activities	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"label": "Glacier Express leg", "sortOrder": 3}}	::1	2026-08-21 06:48:47.954
e30b11cc-317d-4e57-a1b8-d473f03e06d5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/hotel-suggestions	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"area": "Interlaken", "name": "Interlaken Alpine Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:47.973
b87093fd-671f-4c96-a822-5aa35479fadd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/hotel-suggestions	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"area": "Lucerne", "name": "Lucerne Lakeview", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:47.988
623e4414-1f8f-4eed-9b37-cb7a80253a91	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/7a9762e6-cd0b-4b22-ad78-4c624be6e155/hotel-suggestions	destinations	7a9762e6-cd0b-4b22-ad78-4c624be6e155	{"requestBody": {"area": "Zermatt", "name": "Zermatt Chalet Suites", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:48.004
0025ec47-7739-4276-869d-233b126592e3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"bestTimeToVisit": "April – October"}}	::1	2026-08-21 06:48:48.021
3d637b13-0fd3-4560-9433-a48bcfd1b23a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/highlights	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"title": "Paris in two days", "sortOrder": 0, "description": "Eiffel summit, Seine cruise and a Louvre morning."}}	::1	2026-08-21 06:48:48.056
a9d7281c-70b0-4139-9d30-60368c48265e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/highlights	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"title": "Amsterdam canals", "sortOrder": 1, "description": "Canal cruise plus a Zaanse Schans half day."}}	::1	2026-08-21 06:48:48.079
86fc78b7-0ae2-4e42-9d0a-fdc6c0f0bfdb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/highlights	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"title": "Rome & Vatican", "sortOrder": 2, "description": "Skip-the-line Colosseum and Vatican Museums."}}	::1	2026-08-21 06:48:48.096
80ba588e-04bb-44bd-8082-de82bdb524e0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/highlights	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"title": "Venice", "sortOrder": 3, "description": "Gondola ride and a Murano glass workshop."}}	::1	2026-08-21 06:48:48.108
ca2c79fe-98ff-4241-bf8e-314432d1e519	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/activities	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"label": "Eurail segments", "sortOrder": 0}}	::1	2026-08-21 06:48:48.128
31293c6c-474d-495a-b421-5d79e534d6c6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/activities	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"label": "Skip-the-line passes", "sortOrder": 1}}	::1	2026-08-21 06:48:48.143
491281b5-b5dd-40c7-8dbb-d3ee83ec9ec0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/activities	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"label": "Seine dinner cruise", "sortOrder": 2}}	::1	2026-08-21 06:48:48.16
37de1c54-b887-4f17-b459-68fdc7b97176	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/activities	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"label": "Gondola ride", "sortOrder": 3}}	::1	2026-08-21 06:48:48.172
d4841760-5683-42e9-8c27-867d275addf1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/hotel-suggestions	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"area": "Paris", "name": "Paris Left Bank Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:48.196
bccfb4d0-fe75-46b3-94ef-b8f6f9566b01	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/hotel-suggestions	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"area": "Amsterdam", "name": "Amsterdam Canal House", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:48.212
66786f1b-7602-4a7d-826f-ea848e5d4d71	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/b1763f26-0ed0-49a4-8490-80faafc6a155/hotel-suggestions	destinations	b1763f26-0ed0-49a4-8490-80faafc6a155	{"requestBody": {"area": "Rome", "name": "Rome Centro Storico", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:48.226
9033f4aa-2905-46db-ad79-b539e1206f8d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/bdc843b8-9513-4c69-aba3-1f566b02bb8b	destinations	bdc843b8-9513-4c69-aba3-1f566b02bb8b	{"requestBody": {"bestTimeToVisit": "October – March"}}	::1	2026-08-21 06:48:48.251
9334ca2f-0234-4403-9a8d-1624ca7bd0e7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/highlights	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"title": "Alleppey houseboat", "sortOrder": 0, "description": "Overnight on the backwaters with onboard meals."}}	::1	2026-08-21 06:48:48.581
474879e3-705d-4e3c-8363-0133b139c1f9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/highlights	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"title": "Munnar tea estates", "sortOrder": 1, "description": "Plantation walk and the tea museum."}}	::1	2026-08-21 06:48:48.599
e8bda745-939e-4034-bf81-723576a1eff4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/highlights	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"title": "Periyar wildlife", "sortOrder": 2, "description": "Early boat safari on the lake."}}	::1	2026-08-21 06:48:48.683
79f89daa-219c-4373-bd58-eddb8d773bad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/highlights	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"title": "Fort Kochi", "sortOrder": 3, "description": "Chinese fishing nets and a Kathakali evening."}}	::1	2026-08-21 06:48:48.717
12364c26-a9df-48a7-b9b6-1a8ab9e65639	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/activities	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"label": "Kathakali show", "sortOrder": 3}}	::1	2026-08-21 06:48:48.805
3fbfeff5-4207-48bb-a8d5-4d6f0a59de22	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/hotel-suggestions	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"area": "Munnar", "name": "Munnar Hillside Resort", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:48.909
7c203d0b-e1f0-4b48-a153-0f5012905583	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/hotel-suggestions	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"area": "Alleppey", "name": "Alleppey Premium Houseboat", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:48.974
8f775572-2568-4b54-a177-d9e055ccef89	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/bb27ab5f-429d-4e57-865e-a69f2a4e7c35/hotel-suggestions	destinations	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	{"requestBody": {"area": "Fort Kochi", "name": "Kochi Heritage Hotel", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:49.011
663f151c-2d91-4b23-b83e-a4e26da53402	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/highlights	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"title": "Tiger's Nest hike", "sortOrder": 0, "description": "Four to five hours return from the Paro valley floor."}}	::1	2026-08-21 06:48:49.936
cbe5f16f-c5e8-411d-bcdc-f6790d25c2ec	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/highlights	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"title": "Punakha Dzong", "sortOrder": 1, "description": "River confluence and the suspension bridge."}}	::1	2026-08-21 06:48:49.963
6d407810-f1fa-45f5-b466-43f36ae33d0d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/highlights	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"title": "Dochula Pass", "sortOrder": 2, "description": "108 chortens with a Himalayan skyline on clear days."}}	::1	2026-08-21 06:48:50.011
98715061-aa55-4071-87ff-d80d824bd1d7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/highlights	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"title": "Thimphu markets", "sortOrder": 3, "description": "Weekend crafts and a national museum visit."}}	::1	2026-08-21 06:48:50.037
2750fc5a-5429-4e79-a6b8-5bb4441a50ff	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/activities	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"label": "Tiger's Nest trek", "sortOrder": 0}}	::1	2026-08-21 06:48:50.066
b58d9885-c9b5-40f8-a2d2-919244bfa56e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/activities	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"label": "Hot stone bath", "sortOrder": 1}}	::1	2026-08-21 06:48:50.083
d30ea7bd-2100-44b3-85c3-c37c9815f7e5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/activities	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"label": "Archery session", "sortOrder": 2}}	::1	2026-08-21 06:48:50.094
13dce97b-db06-43d9-942c-a76a092eeefa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/activities	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"label": "Monastery blessing", "sortOrder": 3}}	::1	2026-08-21 06:48:50.107
fe8afda3-91ab-4c0f-8959-805adbd63077	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/hotel-suggestions	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"area": "Paro", "name": "Paro Valley Lodge", "sortOrder": 0, "starRating": 3}}	::1	2026-08-21 06:48:50.123
f366f1c7-c3d2-439f-b293-a871e98bf50f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/hotel-suggestions	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"area": "Thimphu", "name": "Thimphu Boutique Hotel", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:50.139
4c7ff758-011a-4b00-abb0-81a59e46eb3f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f/hotel-suggestions	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"area": "Punakha", "name": "Punakha River Resort", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:50.155
86fde311-1aff-4f13-8475-83dd54621700	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"bestTimeToVisit": "March – June, December – February for snow"}}	::1	2026-08-21 06:48:49.036
e18c3f4a-c224-4e74-a5ae-6d218f4f96f3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/highlights	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"title": "Solang Valley", "sortOrder": 0, "description": "Snow activities in winter, paragliding in summer."}}	::1	2026-08-21 06:48:49.079
3421f555-9b02-495e-8f11-868e3aa4a2ba	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/highlights	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"title": "Atal Tunnel & Sissu", "sortOrder": 1, "description": "Day trip into the Lahaul valley."}}	::1	2026-08-21 06:48:49.089
f9b8034f-ab4b-46d3-b19d-a93cd240ddce	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/highlights	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"title": "Old Manali cafés", "sortOrder": 2, "description": "Slow mornings by the river."}}	::1	2026-08-21 06:48:49.103
6c0a462c-8d02-4d04-b3d6-27f1fd0c99d6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/highlights	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"title": "Shimla ridge walk", "sortOrder": 3, "description": "Colonial-era mall road and toy train."}}	::1	2026-08-21 06:48:49.12
ee3b2baf-ca3d-4344-95df-fe1d5582b318	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/activities	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"label": "Paragliding", "sortOrder": 0}}	::1	2026-08-21 06:48:49.132
405b9494-037d-461d-b4a3-1ade6abce0df	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/activities	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"label": "River rafting", "sortOrder": 1}}	::1	2026-08-21 06:48:49.143
aa1872a0-3f4c-4ce6-98fd-8f6697003253	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/activities	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"label": "Snow point excursion", "sortOrder": 2}}	::1	2026-08-21 06:48:49.164
e3ec24cf-aae9-455a-b371-b2641fa7c901	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/activities	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"label": "Bonfire evening", "sortOrder": 3}}	::1	2026-08-21 06:48:49.176
21b5b0f3-9290-4c3e-8ec8-0a1a74e20801	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/hotel-suggestions	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"area": "Manali", "name": "Manali Riverside Resort", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:49.195
b068ed47-e582-458b-a981-98cb78488adb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/hotel-suggestions	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"area": "Shimla", "name": "Shimla Ridge Hotel", "sortOrder": 1, "starRating": 3}}	::1	2026-08-21 06:48:49.206
68723cef-db5a-41d3-8393-3a53deeaf685	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/5849cc1d-988c-4310-b48d-7027c576718c/hotel-suggestions	destinations	5849cc1d-988c-4310-b48d-7027c576718c	{"requestBody": {"area": "Kasol", "name": "Kasol Pine Cottages", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:49.216
a60f3244-14db-4ee6-98d4-52786593a5d7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"bestTimeToVisit": "November – February"}}	::1	2026-08-21 06:48:49.237
04d38630-70ff-484f-ae07-b94c62f09b1e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/highlights	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"title": "Sunset at Anjuna", "sortOrder": 0, "description": "Cliffside cafés and a flea market afternoon."}}	::1	2026-08-21 06:48:49.279
27932c42-180a-4c28-b3ee-c7e49601e13e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/highlights	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"title": "Old Goa churches", "sortOrder": 1, "description": "Basilica of Bom Jesus and Se Cathedral."}}	::1	2026-08-21 06:48:49.293
a881666c-4f5a-48fa-a2d3-4ad29367c876	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/highlights	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"title": "Dudhsagar falls", "sortOrder": 2, "description": "Jeep safari through the Mollem forest."}}	::1	2026-08-21 06:48:49.31
590f822d-1298-4830-a517-d29f482d2f39	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/highlights	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"title": "South Goa beaches", "sortOrder": 3, "description": "Palolem and Agonda, far quieter than the north."}}	::1	2026-08-21 06:48:49.324
8fcd3628-5618-4561-9365-4fc30d18a4bb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/activities	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"label": "Water sports combo", "sortOrder": 0}}	::1	2026-08-21 06:48:49.344
9899f0bc-3a4f-4545-840e-bd2abc5a440e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/activities	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"label": "Sunset cruise", "sortOrder": 1}}	::1	2026-08-21 06:48:49.357
675d3c0a-1012-4409-bf1f-bbec42a8817b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/activities	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"label": "Spice farm lunch", "sortOrder": 2}}	::1	2026-08-21 06:48:49.374
94830213-6a20-41a1-b8f6-d4a5eae2318f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/activities	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"label": "Scooter rental", "sortOrder": 3}}	::1	2026-08-21 06:48:49.382
08c30a86-cf71-407d-8758-dfb869cee21e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/hotel-suggestions	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"area": "North Goa", "name": "Candolim Beach Resort", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:49.394
a52a4db4-0daa-4df4-bdb5-cf6048252d16	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/hotel-suggestions	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"area": "South Goa", "name": "Palolem Boutique Stay", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:49.405
fc61fb03-6dbe-48d5-ac7e-376b9193f574	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/f1ef1bdf-306d-44dd-a054-a05e55df3cf4/hotel-suggestions	destinations	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	{"requestBody": {"area": "Panjim", "name": "Panjim Heritage House", "sortOrder": 2, "starRating": 3}}	::1	2026-08-21 06:48:49.426
03b8e5b3-301f-44da-9689-6296faffa476	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"bestTimeToVisit": "December – April"}}	::1	2026-08-21 06:48:49.443
91277bd3-5f41-403c-bc5b-86a4bd258fd8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/highlights	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"title": "Kandy to Ella train", "sortOrder": 0, "description": "One of the world's great rail journeys."}}	::1	2026-08-21 06:48:49.476
58486d76-ec67-4f1a-b93e-b190f476e956	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/highlights	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"title": "Yala safari", "sortOrder": 1, "description": "Morning jeep drive for leopards and elephants."}}	::1	2026-08-21 06:48:49.493
4c28f63e-1f70-4731-b6a0-0ee6716c2ec2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/highlights	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"title": "Sigiriya rock", "sortOrder": 2, "description": "Early climb before the heat."}}	::1	2026-08-21 06:48:49.503
85921358-7c67-44eb-9830-e69645a983c9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/highlights	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"title": "Galle Fort", "sortOrder": 3, "description": "Rampart walk at sunset."}}	::1	2026-08-21 06:48:49.526
fdcfe3b0-5961-444b-bbb3-6c0aa9113749	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/activities	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"label": "Scenic train seats", "sortOrder": 0}}	::1	2026-08-21 06:48:49.543
4222fb7c-a3cf-489c-b556-ce43af947f86	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/activities	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"label": "Yala safari jeep", "sortOrder": 1}}	::1	2026-08-21 06:48:49.561
332f9d5b-5045-449f-b83a-d018f4dd85ea	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/activities	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"label": "Tea factory visit", "sortOrder": 2}}	::1	2026-08-21 06:48:49.59
886facf2-e021-49d5-8726-ccc09b216054	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/activities	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"label": "Whale watching (seasonal)", "sortOrder": 3}}	::1	2026-08-21 06:48:49.598
2ee74aee-9981-4700-98a9-0c21cea5d839	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/hotel-suggestions	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"area": "Kandy", "name": "Kandy Lake Hotel", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:49.61
564e8537-8db7-4967-9027-d58437e6c337	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/hotel-suggestions	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"area": "Ella", "name": "Ella Valley Cabins", "sortOrder": 1, "starRating": 4}}	::1	2026-08-21 06:48:49.631
562c7889-3282-488c-8f5a-f70b2e609fe1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/91a3d948-35d7-48c7-a608-cbfe92137834/hotel-suggestions	destinations	91a3d948-35d7-48c7-a608-cbfe92137834	{"requestBody": {"area": "Bentota", "name": "Bentota Beach Resort", "sortOrder": 2, "starRating": 4}}	::1	2026-08-21 06:48:49.647
19651511-41ed-494a-9dd8-89235c3309d5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"bestTimeToVisit": "May – December"}}	::1	2026-08-21 06:48:49.674
5fd3d56c-3669-4eba-a9d2-f5457b31bbdc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/highlights	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"title": "Île aux Cerfs", "sortOrder": 0, "description": "Speedboat day trip with a beach barbecue."}}	::1	2026-08-21 06:48:49.712
7917e940-efef-4892-b0fa-37b13b252164	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/highlights	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"title": "Chamarel", "sortOrder": 1, "description": "Seven coloured earths and the waterfall viewpoint."}}	::1	2026-08-21 06:48:49.732
d77d180b-6c4e-41bc-a148-65d9412455eb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/highlights	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"title": "Blue Bay catamaran", "sortOrder": 2, "description": "Snorkelling in the marine park."}}	::1	2026-08-21 06:48:49.746
bc4e9061-9f8e-49c1-b007-1e9f82c56c25	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/highlights	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"title": "Port Louis market", "sortOrder": 3, "description": "Street food and local crafts."}}	::1	2026-08-21 06:48:49.763
312538e5-8bcf-4be3-8a1a-521c5691a8ab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/activities	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"label": "Catamaran cruise", "sortOrder": 0}}	::1	2026-08-21 06:48:49.783
c1362a02-ee83-49c0-b4b4-f0d34e95b446	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/activities	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"label": "Underwater sea walk", "sortOrder": 1}}	::1	2026-08-21 06:48:49.797
c664ee78-a622-4bdf-8f5e-8b613d29d00e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/activities	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"label": "Quad biking", "sortOrder": 2}}	::1	2026-08-21 06:48:49.816
6e29824f-beec-422b-a95f-93852cf69297	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/activities	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"label": "Dolphin watching", "sortOrder": 3}}	::1	2026-08-21 06:48:49.831
7b8dfbd7-f289-426a-a4ef-f1437fabd3fc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/hotel-suggestions	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"area": "Grand Baie", "name": "Grand Baie Beach Resort", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:49.845
0e71b6ee-b4c9-4d1b-9cf6-fe169513518e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/hotel-suggestions	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"area": "Flic en Flac", "name": "Flic en Flac Lagoon Hotel", "sortOrder": 1, "starRating": 5}}	::1	2026-08-21 06:48:49.862
1c661ef2-7d0a-4e89-9d80-9e26e922634f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/destinations/cc596d4f-32a8-47d5-8eed-9d08e6fb7add/hotel-suggestions	destinations	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	{"requestBody": {"area": "Belle Mare", "name": "Belle Mare Luxury Villas", "sortOrder": 2, "starRating": 5}}	::1	2026-08-21 06:48:49.875
e53fec73-eaea-49ed-914c-1903b6335626	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/90f47cdf-17e9-4949-a4f6-3eeba777ed7f	destinations	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	{"requestBody": {"bestTimeToVisit": "March – May, September – November"}}	::1	2026-08-21 06:48:49.894
199090e8-5e18-44b4-9066-cebbcd426466	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions/1cb63ad1-0dec-43fd-a33b-6d6d879b2068	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Ubud", "name": "Ubud Jungle Retreat", "sortOrder": 0, "starRating": 4}}	::1	2026-08-21 06:48:50.192
92bcc916-b504-45f2-8a09-4d43b59c263b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions/0137f5c6-5dfb-4f8f-84ed-16cdb2171c2f	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Seminyak", "name": "Seminyak Beach Resort", "sortOrder": 0, "starRating": 5}}	::1	2026-08-21 06:48:50.215
40c5c5a0-84b9-4991-9d5e-985a59e2e232	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/destinations/25534ce5-2b51-4471-9600-127036598b4b/hotel-suggestions/5a5daff8-f868-4cd3-8acd-738e41ffa96c	destinations	25534ce5-2b51-4471-9600-127036598b4b	{"requestBody": {"area": "Nusa Dua", "name": "Nusa Dua Private Pool Villa", "sortOrder": 0, "starRating": 5}}	::1	2026-08-21 06:48:50.229
c70bb09b-5f6f-4fcc-8eb6-87d369eacdac	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	2f187f61-b96f-4f4a-9206-bb8cf6b0aeee	{"requestBody": {"answer": "Most couples split the stay — beach villa first, water villa for the final nights.", "entityId": "f57f1a08-d092-407c-bc01-962f7328974f", "question": "Water villa or beach villa?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.093
c89fbe0e-23d9-45e4-94da-eaafece5e864	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	90ef7549-366a-4a93-9b73-07ea2fdd758c	{"requestBody": {"answer": "We usually quote half board or all-inclusive so your on-island spend stays predictable.", "entityId": "f57f1a08-d092-407c-bc01-962f7328974f", "question": "Are meals included?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.104
cfbeeff6-bb3c-49d5-95e5-3df5fcedcc49	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	c79da095-49c8-4fae-bf4e-fda5dcd8f7ab	{"requestBody": {"answer": "No. Several resorts have kids clubs and family villas — we shortlist based on who is travelling.", "entityId": "f57f1a08-d092-407c-bc01-962f7328974f", "question": "Is it only for honeymooners?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.124
2faa0562-47d0-4765-8ebd-99a5e09c1c7a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	a1b0e2d2-0755-41eb-b2cb-75791fb411d9	{"requestBody": {"answer": "Peak season (Dec–Jan) hotels move fast — 6 to 8 weeks ahead is comfortable.", "entityId": "2824d140-2702-4a58-a0aa-6030c8134362", "question": "How early should we book?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.14
13a10d82-9bcd-4074-bf49-fc8efa4ff22e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e275eaae-e95e-4c88-bc9b-5b6bdbb4aade	{"requestBody": {"answer": "Very. Most of our Dubai itineraries are built for families with children under 12.", "entityId": "2824d140-2702-4a58-a0aa-6030c8134362", "question": "Is Dubai family friendly?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.147
d43eb2c6-54ca-4f59-8848-f055370f8b5e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	9d4e4000-49aa-44ab-98a8-74bd7d72955b	{"requestBody": {"answer": "Yes, visa assistance is part of the package.", "entityId": "2824d140-2702-4a58-a0aa-6030c8134362", "question": "Do you handle the visa?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.172
58c1050d-f054-43dd-bd70-a148483bd6a0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	4a27fffc-bd17-4cfd-9ef5-27cac39a99fd	{"requestBody": {"answer": "Phuket for nightlife and connectivity, Krabi for quieter beaches and dramatic scenery.", "entityId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "question": "Phuket or Krabi?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.186
1324e271-8160-4eb2-a93c-23008361ad43	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	816ae276-0447-4abc-a10a-de5c383ec8f5	{"requestBody": {"answer": "Yes — we swap late-night stops for island days and shorter transfers.", "entityId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "question": "Is it good for families?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.195
dfd81bf7-8bf7-4cc2-a48e-320fbb59ceb0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	292075d7-fbd2-427d-bf2c-6ff6f02fca27	{"requestBody": {"answer": "Most of our Thailand trips land between ₹38K and ₹85K per person depending on hotels.", "entityId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "question": "What is the average budget?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.206
1b609ee1-24cc-468f-aaaa-91caf118d315	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	0677d3cb-0cb8-4af8-b421-c0757fed4e29	{"requestBody": {"answer": "Any month works; showers are short and everything major is indoors or covered.", "entityId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "question": "Best time to visit?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.218
91c08fd2-b4ee-447a-93fd-5c26abe14690	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	3995a2f1-2093-40c5-afe4-ebe677ad9dcf	{"requestBody": {"answer": "Yes, a Singapore + Kuala Lumpur / Langkawi combo is one of our most requested itineraries.", "entityId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "question": "Can we combine with Malaysia?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.244
de43875a-a709-4c23-876d-d797f33c4727	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	764c4da7-0625-4175-bcb6-c6b47f0863d4	{"requestBody": {"answer": "Very — we include a travel card in most packages.", "entityId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "question": "Is public transport easy?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.26
c45ad0ec-21d6-463a-a83d-f915174d04fc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	080ee3bf-7dcb-452e-b844-221c76a8a5c9	{"requestBody": {"answer": "First-timers usually do Hanoi + Ha Long + Da Nang; add the south only if you have 9+ days.", "entityId": "d487d421-1b6a-47af-aa02-a06fd7a09dfc", "question": "North or south?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.272
850101a7-e886-4e9f-a52a-646ad5424b4d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	d621060c-f367-4873-bc9f-01ac7a5a4142	{"requestBody": {"answer": "Yes, Vietnam is one of the strongest value destinations we sell.", "entityId": "d487d421-1b6a-47af-aa02-a06fd7a09dfc", "question": "Is it budget friendly?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.304
e637f417-89af-4658-adec-60a51511fc67	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	8241d59c-358c-4fff-b465-767df2f2dba9	{"requestBody": {"answer": "Usually one short domestic hop, which we include in the quote.", "entityId": "d487d421-1b6a-47af-aa02-a06fd7a09dfc", "question": "Are internal flights needed?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.32
6587000a-839f-4eba-8c69-6aaa90374950	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	5c7696ab-426a-4dec-8532-b78551741d12	{"requestBody": {"answer": "KL first, then wind down in Langkawi before flying home.", "entityId": "2c239102-080c-4345-aa90-6f25024979fc", "question": "KL or Langkawi first?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.335
d3134d7c-1b06-485c-9e91-8ae56b10e0fb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	cd372859-b5d3-4f43-b6bd-35277a863375	{"requestBody": {"answer": "Yes — short transfers, lifts everywhere and easy vegetarian food.", "entityId": "2c239102-080c-4345-aa90-6f25024979fc", "question": "Good for elderly parents?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.34
f0b975a2-92a7-4322-b457-8cc1ad4af6f2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	683505aa-0b19-4941-bd99-ceccc082e655	{"requestBody": {"answer": "Direct flights from several Indian cities keep the trip short.", "entityId": "2c239102-080c-4345-aa90-6f25024979fc", "question": "How is connectivity?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.348
fbf0aed6-9504-47a9-9b19-2a9321048327	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e56699cc-7c50-46df-8acc-1054b21bae44	{"requestBody": {"answer": "Late March to early April in most cities, but it shifts every year — we track forecasts.", "entityId": "42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48", "question": "When is blossom season?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.363
bdc802ae-0626-4ae9-87f3-8f8de647973e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e1f1e947-8690-45a6-a5d6-66b09f2dd79e	{"requestBody": {"answer": "For multi-city routes, usually yes. We compare pass vs point-to-point in your quote.", "entityId": "42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48", "question": "Is a rail pass worth it?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.379
74b137ac-4fd5-4be8-9cb2-3b82b0e86280	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	1329c0ca-ba32-4730-ad90-15871218eb27	{"requestBody": {"answer": "Mid-range Japan is comparable to Europe; we control cost through hotel location and rail choices.", "entityId": "42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48", "question": "Is Japan expensive?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.387
0b3ef7f9-2043-468c-a6e2-fbc2fe26a6b6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	ea614d56-4b6e-4393-9686-a92a29d73a11	{"requestBody": {"answer": "For 4+ travel days the pass usually wins; we run the numbers for your route.", "entityId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "question": "Swiss Travel Pass or individual tickets?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.394
96b95212-d165-478b-aa93-903fc7977343	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	f8d40991-45a6-434d-a416-905db8bfb03d	{"requestBody": {"answer": "Yes — a Switzerland + Paris rail combination is very popular.", "entityId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "question": "Can we add Paris?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.409
462e9367-e39b-4662-8830-707f72f1799a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	12a58b80-c435-4425-a064-b0cec2079752	{"requestBody": {"answer": "Interlaken and Lucerne cover most highlights with minimal repacking.", "entityId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "question": "Best base towns?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.423
e23cd4e9-8251-436d-8c8d-b7ed3ed88a8b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	6721f0e7-2676-4403-82df-f9048b17e005	{"requestBody": {"answer": "Three, four at most. More cities means more time in stations.", "entityId": "b1763f26-0ed0-49a4-8490-80faafc6a155", "question": "How many cities in 10 days?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.44
37abf99a-7c56-41af-af0e-20094ac3d51d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	fa0fea90-ea85-4a03-be2a-720f3e4f2c2d	{"requestBody": {"answer": "We build both; private costs more but the pace is yours.", "entityId": "b1763f26-0ed0-49a4-8490-80faafc6a155", "question": "Group tour or private?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.455
c98693b4-d1f7-45ff-b0cb-9694b9543773	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	51a98351-e202-479b-a459-0312f6757b2e	{"requestBody": {"answer": "Start 8–10 weeks before departure, especially in summer.", "entityId": "b1763f26-0ed0-49a4-8490-80faafc6a155", "question": "When to apply for the visa?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.471
82886b66-2333-4719-8d27-c59fd73590fc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	c17f46d3-fc4b-4680-b258-d368b7435557	{"requestBody": {"answer": "Jaipur → Jodhpur → Jaisalmer, or Udaipur → Jodhpur if you prefer a slower pace.", "entityId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "question": "Best circuit for 7 days?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.478
ebcc5174-b4ec-4809-928a-fc494886a85b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e1212cc5-ef58-46d6-b7a9-03518f9c0c60	{"requestBody": {"answer": "It is very hot from April to June; we'd suggest hill destinations instead.", "entityId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "question": "Is summer travel possible?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.487
3b0dc989-85db-4376-acdb-d5cb0fb7af41	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	908439f5-b8cf-438d-a853-faac665b2755	{"requestBody": {"answer": "Private car with driver gives the most flexibility across the state.", "entityId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "question": "Train or car?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.502
091935c1-0f35-47de-b45b-91ef96bc6f2e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	05f2da49-589e-4377-b914-a542a0a630b8	{"requestBody": {"answer": "June to August is lush and cheaper, but plan for rain most afternoons.", "entityId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "question": "Monsoon travel?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.516
5af140c1-4df0-4db1-8e02-6966983cacab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	d9ccb409-9309-45f9-971d-bbef743fce43	{"requestBody": {"answer": "Each leg is roughly 3–4 hours; we break long drives with viewpoint stops.", "entityId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "question": "How much driving?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.532
4b881dd5-6edf-4b9f-8346-7da9d3b1a946	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	a6e2af73-ecbb-4fc2-8ec9-0aa859e076c6	{"requestBody": {"answer": "Yes — private houseboat plus a hill resort is our most booked Kerala combination.", "entityId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "question": "Good for honeymoon?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.547
4d971ca3-cdbe-41f3-a388-78394ef3d33d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	ba6e28ec-136f-43fd-9dfc-e613823b4fd9	{"requestBody": {"answer": "January–February around Solang and Sissu, subject to weather that season.", "entityId": "5849cc1d-988c-4310-b48d-7027c576718c", "question": "Where is guaranteed snow?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.555
c8dbccc3-2f74-44f3-9418-ef3826ff1775	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	4dda3cd5-6da9-40bb-8148-5bbf7ab5e88e	{"requestBody": {"answer": "Flights to Bhuntar save a full day; overnight coaches are the budget route.", "entityId": "5849cc1d-988c-4310-b48d-7027c576718c", "question": "Volvo or flight?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.562
c67f1d8a-7d23-4d65-985e-d0139f72af6f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	b0c22543-3a63-4896-b6d3-c8626842c5d8	{"requestBody": {"answer": "Yes for Shimla–Manali; Spiti is better for older children and adults.", "entityId": "5849cc1d-988c-4310-b48d-7027c576718c", "question": "Suitable for kids?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.578
e54d0e54-0394-49d7-87e7-6b05bedc0642	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	1a6ffb7d-8fd3-4c0a-be0d-4b423c315def	{"requestBody": {"answer": "North for nightlife and cafés, south for quiet beaches and resorts.", "entityId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "question": "North or south Goa?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.594
dcb88572-cc32-440f-b4d0-0816d55aa54f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e8fd5428-07e3-482d-9d87-3a9acd7ef193	{"requestBody": {"answer": "May to September, though the monsoon closes many water activities.", "entityId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "question": "Cheapest months?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.61
c7630b09-681f-4113-ad5c-3ddd1a7773ed	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	e7281c6b-6f81-4a9b-8123-2fa572a3bf40	{"requestBody": {"answer": "A scooter or a private car makes a big difference; we can arrange both.", "entityId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "question": "Is a car needed?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.618
0af45a5a-12c7-4274-9894-a890e33fd725	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	d87bb5f5-e457-4303-ab55-34f3a09a3a62	{"requestBody": {"answer": "Seven days covers hill country, one safari park and a beach stay.", "entityId": "91a3d948-35d7-48c7-a608-cbfe92137834", "question": "How many days are enough?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.626
4c16413d-aafa-4fb1-b2c3-58aa218d7df8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	29bf71ce-772f-49b2-bed8-c280c576fe32	{"requestBody": {"answer": "We recommend a car with driver; roads are narrow and slow.", "entityId": "91a3d948-35d7-48c7-a608-cbfe92137834", "question": "Is self-drive advisable?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.644
06ee099b-c80f-43a7-9ae9-8b39ac4863bd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	69942cf2-dae9-4f8b-9621-14428d01220f	{"requestBody": {"answer": "Yes, with shorter driving days and a beach base at the end.", "entityId": "91a3d948-35d7-48c7-a608-cbfe92137834", "question": "Is it family friendly?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.659
ee6b7dff-3abc-4686-b215-5d25110a2f84	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	8199b290-30be-48f2-b2bf-a2b8fa1c6ea0	{"requestBody": {"answer": "Maldives for pure resort isolation, Mauritius when you want sightseeing too.", "entityId": "cc596d4f-32a8-47d5-8eed-9d08e6fb7add", "question": "Mauritius or Maldives?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.676
299f3a34-5e04-45a3-bc1d-cdfbd7444499	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	3363b16b-33fc-4526-85dc-48882cc990eb	{"requestBody": {"answer": "Roughly six to seven hours from major Indian metros.", "entityId": "cc596d4f-32a8-47d5-8eed-9d08e6fb7add", "question": "How long is the flight?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.686
c75afd68-05c9-4470-a941-6c15a1ff2029	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	0a6a0007-a08f-464f-9495-b997fbf03c61	{"requestBody": {"answer": "Often yes, since restaurants outside resorts can be spread out.", "entityId": "cc596d4f-32a8-47d5-8eed-9d08e6fb7add", "question": "All-inclusive worth it?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.71
d54bb01a-40bf-493a-926a-d88a27b49f23	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	260c0d28-da14-4043-9b8e-a08aeb8bf67c	{"requestBody": {"answer": "The Tiger's Nest hike is moderate; ponies are available for part of the climb.", "entityId": "90f47cdf-17e9-4949-a4f6-3eeba777ed7f", "question": "How fit do I need to be?", "sortOrder": 0, "entityType": "destination"}}	::1	2026-08-21 06:51:57.747
72d7ef91-1173-418e-bfe4-2edbba39a505	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	8d7de2da-8881-4a81-ac92-7dbb404c618e	{"requestBody": {"answer": "Fly into Paro for comfort, or drive in via Phuentsholing to save cost.", "entityId": "90f47cdf-17e9-4949-a4f6-3eeba777ed7f", "question": "By road or air?", "sortOrder": 1, "entityType": "destination"}}	::1	2026-08-21 06:51:57.763
03586381-6d98-44f9-94df-c4fce40d68c0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/faq	cms	8d2ccd0e-b892-4f9b-b18f-2b41fc29fb06	{"requestBody": {"answer": "Yes, our quotes show it as a separate, transparent line item.", "entityId": "90f47cdf-17e9-4949-a4f6-3eeba777ed7f", "question": "Is the daily fee included?", "sortOrder": 2, "entityType": "destination"}}	::1	2026-08-21 06:51:57.79
05c38b35-4b67-4136-9c7d-fda156e6fc24	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/4e7f5e85-4690-498d-8335-39af4921034b	packages	4e7f5e85-4690-498d-8335-39af4921034b	{"requestBody": {"slug": "bali-honeymoon-escape", "title": "Bali Honeymoon Escape", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 58900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 58900}], "destinationId": "25534ce5-2b51-4471-9600-127036598b4b", "galleryImages": [{"sortOrder": 0, "storageKey": "9f33283f-b3d3-47dc-8b4c-1992e768476d-bali-C-ZvmxxP.jpg"}], "itineraryDays": [{"title": "Arrival in Bali", "dayNumber": 1, "description": "Airport pick-up, welcome drink and an easy evening at the resort."}, {"title": "Ubud green day", "dayNumber": 2, "description": "Tegallalang terraces, a jungle swing stop and the sacred monkey forest."}, {"title": "Nusa Penida", "dayNumber": 3, "description": "Speedboat crossing, Kelingking viewpoint and a snorkelling stop at Crystal Bay."}, {"title": "Uluwatu & Seminyak", "dayNumber": 4, "description": "Cliff temple, Kecak dance and a beach club sunset."}, {"title": "Free day + spa", "dayNumber": 5, "description": "Balinese couple's spa and a candlelight dinner by the pool."}, {"title": "Departure", "dayNumber": 6, "description": "Breakfast, checkout and an airport transfer."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-21 06:53:35.761
ce7ca0d9-53a3-453b-b27b-1f83f66e4aa1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/518aee17-5f2f-4d00-ba85-2095083bc6a9	packages	518aee17-5f2f-4d00-ba85-2095083bc6a9	{"requestBody": {"slug": "interlaken-alpine-adventure", "title": "Switzerland Alpine Classic", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 189900, "inclusions": ["Hotels", "Activities"], "durationDays": 8, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 189900}], "destinationId": "7a9762e6-cd0b-4b22-ad78-4c624be6e155", "galleryImages": [{"sortOrder": 0, "storageKey": "5872958f-c810-47d6-947f-533d6335f919-switzerland-D5Q0EHJx.jpg"}], "itineraryDays": [{"title": "Arrive Zurich", "dayNumber": 1, "description": "Train to Lucerne and a lakeside evening."}, {"title": "Mount Pilatus", "dayNumber": 2, "description": "Golden round trip by cogwheel, cable car and boat."}, {"title": "To Interlaken", "dayNumber": 3, "description": "Scenic rail transfer and a Harder Kulm sunset."}, {"title": "Jungfraujoch", "dayNumber": 4, "description": "Top of Europe with the ice palace and plateau."}, {"title": "Grindelwald First", "dayNumber": 5, "description": "Cliff walk, first flyer and mountain carts."}, {"title": "Zermatt", "dayNumber": 6, "description": "Gornergrat railway and Matterhorn views."}, {"title": "Free day", "dayNumber": 7, "description": "Optional paragliding or a Lauterbrunnen valley walk."}, {"title": "Departure", "dayNumber": 8, "description": "Transfer to Zurich airport."}], "seasonalRates": [], "durationNights": 7, "routeMapPoints": []}}	::1	2026-08-21 06:53:36.961
5bdff88c-a89c-4624-9daa-ae9a7298da40	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/f989fedd-4be6-4adf-83ac-c794cf3a4831	packages	f989fedd-4be6-4adf-83ac-c794cf3a4831	{"requestBody": {"slug": "kerala-backwater-serenity", "title": "Kerala Backwater Serenity", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 26900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 26900}], "destinationId": "bb27ab5f-429d-4e57-865e-a69f2a4e7c35", "galleryImages": [{"sortOrder": 0, "storageKey": "6ecdfd05-8c45-426d-9dcb-a86da8458fb1-kerala-BRDUcEbv.jpg"}], "itineraryDays": [{"title": "Arrive Kochi", "dayNumber": 1, "description": "Fort Kochi walk and a Kathakali performance."}, {"title": "To Munnar", "dayNumber": 2, "description": "Waterfall stops en route and a tea estate evening."}, {"title": "Munnar sightseeing", "dayNumber": 3, "description": "Eravikulam park, Mattupetty dam and the tea museum."}, {"title": "Thekkady", "dayNumber": 4, "description": "Spice plantation tour and a Periyar lake boat ride."}, {"title": "Alleppey houseboat", "dayNumber": 5, "description": "Board a private houseboat with lunch, dinner and breakfast onboard."}, {"title": "Departure", "dayNumber": 6, "description": "Disembark and transfer to Kochi airport."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-21 06:53:37.14
038c7710-381b-4573-9b13-0e6bbdf5a69c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/4b1243ae-b604-4795-9954-6e50548a2be9	packages	4b1243ae-b604-4795-9954-6e50548a2be9	{"requestBody": {"slug": "goa-long-weekend", "title": "Goa Long Weekend", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 16900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 4, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 16900}], "destinationId": "f1ef1bdf-306d-44dd-a054-a05e55df3cf4", "galleryImages": [{"sortOrder": 0, "storageKey": "70af56e4-0ce1-4ddc-9d43-f14685c273d8-goa-DegD7h4J.jpg"}], "itineraryDays": [{"title": "Arrival", "dayNumber": 1, "description": "Check-in at a beachfront resort and a Candolim sunset."}, {"title": "North Goa", "dayNumber": 2, "description": "Fort Aguada, Calangute and a water sports session."}, {"title": "Old Goa & cruise", "dayNumber": 3, "description": "Churches, Panjim lanes and a Mandovi river cruise."}, {"title": "Departure", "dayNumber": 4, "description": "Breakfast and airport transfer."}], "seasonalRates": [], "durationNights": 3, "routeMapPoints": []}}	::1	2026-08-21 06:53:37.764
62a79cfc-46c4-4398-b549-3c1d6093c870	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/5615d775-f89b-470f-8f4a-f8a38a881bd2	packages	5615d775-f89b-470f-8f4a-f8a38a881bd2	{"requestBody": {"slug": "maldives-overwater-villa-retreat", "title": "Maldives Water Villa Retreat", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 118900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 118900}], "destinationId": "f57f1a08-d092-407c-bc01-962f7328974f", "galleryImages": [{"sortOrder": 0, "storageKey": "26209972-e947-4a22-b170-56fda5b1a9b8-maldives-DgCIoG22.jpg"}], "itineraryDays": [{"title": "Arrival at Malé", "dayNumber": 1, "description": "Speedboat to the resort, welcome ceremony and a beach villa check-in."}, {"title": "Reef day", "dayNumber": 2, "description": "House-reef snorkelling and an afternoon at the infinity pool."}, {"title": "Sandbank & dolphins", "dayNumber": 3, "description": "Private sandbank picnic followed by a sunset dolphin cruise."}, {"title": "Water villa move", "dayNumber": 4, "description": "Shift to the overwater villa with a floating breakfast and spa session."}, {"title": "Departure", "dayNumber": 5, "description": "Late breakfast and speedboat back to Malé."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-21 06:53:35.963
8bfdd0b3-3af2-4169-be55-77341addbaf3	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/fbce3a52-8e3d-4629-a97b-d27108ee670e	packages	fbce3a52-8e3d-4629-a97b-d27108ee670e	{"requestBody": {"slug": "dubai-city-desert-explorer", "title": "Dubai Family Holiday", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 61900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 5, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 61900}], "destinationId": "2824d140-2702-4a58-a0aa-6030c8134362", "galleryImages": [{"sortOrder": 0, "storageKey": "734068ad-a5cb-463b-a597-19165acfae94-dubai-DRCuuGaX.jpg"}], "itineraryDays": [{"title": "Arrival", "dayNumber": 1, "description": "Meet and greet, hotel check-in and a Marina walk in the evening."}, {"title": "City & Burj Khalifa", "dayNumber": 2, "description": "Half-day city tour with a timed sunset slot at the observation deck."}, {"title": "Desert safari", "dayNumber": 3, "description": "Dune bashing, camel ride and a BBQ dinner with live entertainment."}, {"title": "Abu Dhabi", "dayNumber": 4, "description": "Sheikh Zayed Grand Mosque and a Corniche drive."}, {"title": "Departure", "dayNumber": 5, "description": "Free morning for shopping, then airport transfer."}], "seasonalRates": [], "durationNights": 4, "routeMapPoints": []}}	::1	2026-08-21 06:53:36.585
212b3d9d-fb22-4907-9f4e-82f050df5be0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/1c39245e-c86f-41c1-b09e-26b201c99cc1	packages	1c39245e-c86f-41c1-b09e-26b201c99cc1	{"requestBody": {"slug": "bangkok-street-food-temples-trail", "title": "Thailand Island Hopper", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 44900, "inclusions": ["Flights", "Hotels", "Transfers", "Activities"], "durationDays": 7, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 44900}], "destinationId": "eae20d80-da05-4a8c-8727-1886bcc7cf52", "galleryImages": [{"sortOrder": 0, "storageKey": "92aeaf03-e553-4cdf-811b-ba6941d510ce-thailand-C2yi6qi_.jpg"}], "itineraryDays": [{"title": "Arrive Phuket", "dayNumber": 1, "description": "Transfer to Patong and an evening beach walk."}, {"title": "Phi Phi islands", "dayNumber": 2, "description": "Full-day speedboat tour with lunch and snorkelling."}, {"title": "Phang Nga bay", "dayNumber": 3, "description": "James Bond island and sea canoeing through the caves."}, {"title": "Krabi transfer", "dayNumber": 4, "description": "Drive to Ao Nang and a relaxed beach afternoon."}, {"title": "Four islands tour", "dayNumber": 5, "description": "Longtail boat to Tup, Chicken and Poda islands."}, {"title": "Bangkok", "dayNumber": 6, "description": "Flight to Bangkok, temple stop and a night market."}, {"title": "Departure", "dayNumber": 7, "description": "Breakfast and transfer to the airport."}], "seasonalRates": [], "durationNights": 6, "routeMapPoints": []}}	::1	2026-08-21 06:53:36.749
7395ffdd-60e6-43c4-bc3e-23e004e05f53	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/cded3556-e733-41ce-982a-9cce008c17a2	packages	cded3556-e733-41ce-982a-9cce008c17a2	{"requestBody": {"slug": "rajasthan-royal-trail", "title": "Rajasthan Royal Trail", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 32900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 7, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 32900}], "destinationId": "bdc843b8-9513-4c69-aba3-1f566b02bb8b", "galleryImages": [{"sortOrder": 0, "storageKey": "a7b18a12-4bdb-4263-9453-c7afa7958b64-rajasthan-oD07PIG2.jpg"}], "itineraryDays": [{"title": "Arrive Udaipur", "dayNumber": 1, "description": "City Palace and a Lake Pichola sunset boat ride."}, {"title": "Udaipur to Jodhpur", "dayNumber": 2, "description": "Ranakpur temple stop en route."}, {"title": "Jodhpur", "dayNumber": 3, "description": "Mehrangarh fort and the blue city lanes."}, {"title": "To Jaisalmer", "dayNumber": 4, "description": "Long drive with a desert highway stop."}, {"title": "Jaisalmer", "dayNumber": 5, "description": "Golden fort, havelis and a Sam dunes camp night."}, {"title": "To Jaipur", "dayNumber": 6, "description": "Travel day with an evening at Chokhi Dhani."}, {"title": "Jaipur & departure", "dayNumber": 7, "description": "Amber Fort in the morning, then airport transfer."}], "seasonalRates": [], "durationNights": 6, "routeMapPoints": []}}	::1	2026-08-21 06:53:37.315
d53a37c9-f796-4be0-896c-3f1f13756057	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/9fb09db3-7da0-4e3d-aecd-42b2201c2d60	packages	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	{"requestBody": {"slug": "singapore-family-discovery", "title": "Singapore + Malaysia Combo", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 78900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 7, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 78900}], "destinationId": "f0826aab-9c60-41d2-82e2-dd2f9bff7902", "galleryImages": [{"sortOrder": 0, "storageKey": "44b0b38f-e12c-4bda-8b52-11f2b76c0a8b-singapore-D61jditK.jpg"}], "itineraryDays": [{"title": "Arrive Singapore", "dayNumber": 1, "description": "Transfer, evening at Marina Bay light show."}, {"title": "Sentosa", "dayNumber": 2, "description": "Universal Studios with a cable car ride."}, {"title": "City & Gardens", "dayNumber": 3, "description": "City tour, Gardens by the Bay domes and the Supertree show."}, {"title": "To Kuala Lumpur", "dayNumber": 4, "description": "Coach transfer with a Malacca photo stop."}, {"title": "KL city", "dayNumber": 5, "description": "Batu Caves, Petronas twin towers and KL Tower."}, {"title": "Genting Highlands", "dayNumber": 6, "description": "Cable car, theme park and a hilltop lunch."}, {"title": "Departure", "dayNumber": 7, "description": "Free morning and airport transfer."}], "seasonalRates": [], "durationNights": 6, "routeMapPoints": []}}	::1	2026-08-21 06:53:37.632
5183cb2c-4d38-4521-aaa3-b1cda5fc15ef	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/17ca6f62-feff-4c5a-bc36-02aba7ea9595	packages	17ca6f62-feff-4c5a-bc36-02aba7ea9595	{"requestBody": {"slug": "europe-highlights-paris-swiss-rome", "title": "Europe Highlights: Paris, Swiss & Rome", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 234900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 11, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 234900}], "destinationId": "b1763f26-0ed0-49a4-8490-80faafc6a155", "galleryImages": [{"sortOrder": 0, "storageKey": "909fcf41-f28f-4f35-a1e5-4f91b8655737-europe-gallery.jpg"}], "itineraryDays": [{"title": "Arrive Paris", "dayNumber": 1, "description": "Seine evening cruise after check-in."}, {"title": "Paris", "dayNumber": 2, "description": "Eiffel summit, Louvre and Montmartre."}, {"title": "Disneyland or Versailles", "dayNumber": 3, "description": "Choose your day out of the city."}, {"title": "To Switzerland", "dayNumber": 4, "description": "High-speed rail to Lucerne."}, {"title": "Mount Pilatus", "dayNumber": 5, "description": "Golden round trip and lake cruise."}, {"title": "Interlaken", "dayNumber": 6, "description": "Jungfraujoch excursion."}, {"title": "To Venice", "dayNumber": 7, "description": "Rail transfer and an evening in San Marco."}, {"title": "Venice", "dayNumber": 8, "description": "Gondola ride and Murano glass workshop."}, {"title": "To Rome", "dayNumber": 9, "description": "Train south, Trevi and Spanish Steps at night."}, {"title": "Rome", "dayNumber": 10, "description": "Colosseum and Vatican Museums with skip-the-line entry."}, {"title": "Departure", "dayNumber": 11, "description": "Transfer to Rome airport."}], "seasonalRates": [], "durationNights": 10, "routeMapPoints": []}}	::1	2026-08-21 06:53:38.11
ce0296c2-8b3a-4dfa-8c05-48ee577e91d1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	PATCH /api/v1/packages/82e2fc31-77dc-4c33-b1ba-202048ac14c2	packages	82e2fc31-77dc-4c33-b1ba-202048ac14c2	{"requestBody": {"slug": "shimla-manali-adventure-trail", "title": "Himachal Snow Adventure", "hotels": [{"cityName": "Shimla", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 1, "checkOutDay": 3}, {"cityName": "Manali", "mealPlan": "Breakfast", "roomType": "Standard", "checkInDay": 3, "checkOutDay": 6}], "status": "PUBLISHED", "flights": [], "basePrice": 22900, "inclusions": ["Hotels", "Transfers", "Activities"], "durationDays": 6, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 22900}], "destinationId": "5849cc1d-988c-4310-b48d-7027c576718c", "galleryImages": [{"sortOrder": 0, "storageKey": "484fc1c1-5298-4b9c-aa97-0c7a7561a92b-shimla-manali-adventure-trail.jpg"}], "itineraryDays": [{"title": "Arrive Shimla", "dayNumber": 1, "description": "Mall road and ridge walk in the evening."}, {"title": "Kufri", "dayNumber": 2, "description": "Snow point excursion and horse riding."}, {"title": "To Manali", "dayNumber": 3, "description": "Scenic drive along the Beas with river stops."}, {"title": "Solang valley", "dayNumber": 4, "description": "Ropeway, snow activities and paragliding option."}, {"title": "Atal Tunnel & Sissu", "dayNumber": 5, "description": "Day trip into Lahaul with a packed lunch."}, {"title": "Departure", "dayNumber": 6, "description": "Old Manali café breakfast and drop."}], "seasonalRates": [], "durationNights": 5, "routeMapPoints": []}}	::1	2026-08-21 06:53:37.993
71702f0c-026d-4482-adef-cd25b07479cc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/packages	packages	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	{"requestBody": {"slug": "vietnam-discovery", "title": "Vietnam Discovery", "hotels": [], "status": "PUBLISHED", "flights": [], "basePrice": 49900, "inclusions": ["Flights", "Hotels", "Transfers"], "durationDays": 7, "pricingTiers": [{"name": "Standard", "currency": "INR", "basePrice": 49900}], "destinationId": "d487d421-1b6a-47af-aa02-a06fd7a09dfc", "galleryImages": [], "itineraryDays": [{"title": "Arrive Hanoi", "dayNumber": 1, "description": "Old Quarter walk and a water puppet show."}, {"title": "Ha Long Bay", "dayNumber": 2, "description": "Overnight cruise with kayaking and a cave visit."}, {"title": "Back to Hanoi", "dayNumber": 3, "description": "Cruise brunch, return drive and a street food evening."}, {"title": "Fly to Da Nang", "dayNumber": 4, "description": "Beach afternoon and the Dragon Bridge at night."}, {"title": "Ba Na Hills", "dayNumber": 5, "description": "Cable car, Golden Bridge and French village."}, {"title": "Hoi An", "dayNumber": 6, "description": "Ancient town, tailoring and a lantern boat ride."}, {"title": "Departure", "dayNumber": 7, "description": "Transfer to Da Nang airport."}], "seasonalRates": [], "durationNights": 6, "routeMapPoints": []}}	::1	2026-08-21 06:53:38.165
61543a65-c289-4a21-bece-8a4e9933d36c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	407cb0a7-4582-4b9f-998e-7ab55ca81ad0	{"requestBody": {"body": "Most Bali itineraries try to fit the whole island into a week. The result is three hours in a car every day and a holiday that feels like a commute. The fix is simple: pick two bases, and let each one do what it does best.\\n\\nStart in Ubud. Three nights is enough for the rice terraces, a waterfall morning, one temple and a slow café day. Book a stay with a valley view rather than one on the main road — the price difference is small and the mornings are completely different.\\n\\nThen move south. Seminyak or Nusa Dua, depending on whether you want beach clubs or calm water. Keep one full day free for Nusa Penida, which needs an early start, and one entirely empty. That empty day is the one people remember.\\n\\nOn budget: mid-range Bali is genuinely affordable, but transfers add up. Pre-booking a car with a driver for the full day usually costs less than three separate app rides, and you are not negotiating in the sun each time.", "slug": "bali-7-day-itinerary", "title": "A realistic 7-day Bali itinerary that isn't exhausting", "status": "PUBLISHED", "excerpt": "Two bases, four highlights and enough unscheduled time to actually enjoy the island.", "category": "Travel Guides", "readMinutes": 6, "coverImageKey": "5f96a70d-1cdd-4ba8-bbb5-c6b4a9e374e7-bali-C-ZvmxxP.jpg"}}	::1	2026-08-21 07:01:31.409
f631e168-bb94-40df-ba42-487cff24c40a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	8f022a9f-9f46-4edb-90dc-f303d1d43cf0	{"requestBody": {"body": "The resort you choose in the Maldives decides your entire trip, because you cannot casually change islands. Three things drive both cost and experience: how you get there, what you eat, and what is under the water outside your villa.\\n\\nSpeedboat resorts are cheaper to reach and let you arrive at any hour. Seaplane resorts are further out, more scenic and add a significant per-person cost — and they only fly in daylight.\\n\\nOn meals, half board is the sweet spot for most couples. All-inclusive only pays off if you drink, or if the resort is far from any alternative.\\n\\nFinally, ask about the house reef. A resort with a good one gives you a free activity every single day. Without it, snorkelling becomes a paid excursion every time.", "slug": "maldives-resort-choice", "title": "How to choose a Maldives resort without overpaying", "status": "PUBLISHED", "excerpt": "Transfer type, meal plan and house reef quality matter more than the star rating.", "category": "Honeymoon", "readMinutes": 5, "coverImageKey": "7c7076d8-5589-4bd2-b23d-0a75676db41b-maldives-DgCIoG22.jpg"}}	::1	2026-08-21 07:01:31.426
a02a42aa-df5d-4da9-bb51-497d68fe4d49	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	e579e373-3341-4d83-b77c-5b9e5d346130	{"requestBody": {"body": "Schengen rejections are rarely about money. They are usually about documents that do not agree with each other — dates on the itinerary that do not match the hotel booking, or a cover letter that describes a different route.\\n\\nKeep one master itinerary and build every other document from it. Flights, hotels, insurance and the cover letter should all show the same entry date, exit date and cities.\\n\\nSix months of bank statements should show a steady balance, not a large deposit landing a week before the appointment. If someone is sponsoring the trip, their documents need to be complete too.\\n\\nApply early. In summer, appointment slots disappear faster than the processing time itself, and travel plans built around a tight visa window are stressful for everyone.", "slug": "schengen-visa-checklist", "title": "Schengen visa: the document checklist people get wrong", "status": "PUBLISHED", "excerpt": "Bank statements, cover letters and the booking proofs that actually get accepted.", "category": "Visa", "readMinutes": 7, "coverImageKey": "d1b423a7-4b7d-4442-b597-eb37205fd02b-europe.jpg"}}	::1	2026-08-21 07:01:31.447
acb1497a-c9b1-4181-8a79-ad961682ab68	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	85587a3b-5675-498a-a4ba-59dcc5c8fc10	{"requestBody": {"body": "Multi-generation trips fail on pace, not on destination. Grandparents need shorter days, children need earlier meals, and everyone needs a place to sit down.\\n\\nChoose one hotel and do day trips from it wherever possible. Repacking every second night is the single fastest way to exhaust a family group.\\n\\nBook the big attraction on day two, not day one. Jet lag and travel fatigue on the first day turn a great experience into a queue.\\n\\nFinally, check food. Easy vegetarian access, familiar breakfast options and a kettle in the room solve more problems than an extra star of hotel rating.", "slug": "family-travel-pace", "title": "Planning a family trip that works for three generations", "status": "PUBLISHED", "excerpt": "Pace, proximity and food access decide whether everyone enjoys the holiday.", "category": "Family Travel", "readMinutes": 5, "coverImageKey": "3aafe5b1-6f36-46d4-93b2-067c3855d131-singapore-D61jditK.jpg"}}	::1	2026-08-21 07:01:31.463
ded81dea-b992-4014-b390-6231ee0f55a7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	e1e803d6-02ea-46f3-a698-acc56f52cfe4	{"requestBody": {"body": "Southeast Asia does not have one season. Thailand's west coast and east coast peak at different times, and Vietnam runs almost 2,000 kilometres north to south with three separate climates.\\n\\nNovember to March is the safe window for Thailand's Andaman side, Bali and most of Vietnam. That is also when prices are highest, so book earlier than you think you need to.\\n\\nThe shoulder months — April, May, October — often give you 80% of the weather at 60% of the cost. Rain in these months tends to arrive in short, heavy bursts rather than all day.\\n\\nIf your dates are fixed and they fall in the wet season, change the destination, not the plan. There is almost always a nearby island or region that is dry that month.", "slug": "best-time-southeast-asia", "title": "When to travel to Southeast Asia, month by month", "status": "PUBLISHED", "excerpt": "A practical seasonality guide for Thailand, Bali, Vietnam and Malaysia.", "category": "Destinations", "readMinutes": 6, "coverImageKey": "66107ef1-4dca-46bf-97ef-67441618a134-thailand-C2yi6qi_.jpg"}}	::1	2026-08-21 07:01:31.48
8c3ba97b-64af-4ea7-bea4-4599a06edfd2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	POST /api/v1/cms/blog	cms	d57624cb-d577-40b3-a33d-6af3c9856add	{"requestBody": {"body": "Manali is easy and it is busy. If you have seven days and tolerance for mountain roads, the valleys on either side of it are a different holiday altogether.\\n\\nTirthan is the gentlest option — trout streams, forest walks and homestays, roughly two hours off the main highway.\\n\\nSpiti needs acclimatisation and a plan. Go via Shimla and return via Manali once the pass opens, never the reverse in a hurry.\\n\\nChitkul, at the end of the Sangla valley, is a single-road village with a view that justifies the drive. Carry cash and expect patchy network.", "slug": "adventure-himachal", "title": "Himachal beyond Manali: routes worth the extra drive", "status": "PUBLISHED", "excerpt": "Tirthan, Spiti and Chitkul for travellers who want quiet over convenience.", "category": "Adventure", "readMinutes": 6, "coverImageKey": "f9617784-30ab-4935-9eb3-788f77c7d439-himachal-pradesh.jpg"}}	::1	2026-08-21 07:01:31.497
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.banners (id, "tenantId", "imageKey", "linkUrl", placement, "sortOrder", "activeFrom", "activeTo") FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.blog_posts (id, "tenantId", title, slug, body, "coverImageKey", "authorId", status, "publishedAt", "createdAt", "updatedAt", category, excerpt, "readMinutes") FROM stdin;
407cb0a7-4582-4b9f-998e-7ab55ca81ad0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	A realistic 7-day Bali itinerary that isn't exhausting	bali-7-day-itinerary	Most Bali itineraries try to fit the whole island into a week. The result is three hours in a car every day and a holiday that feels like a commute. The fix is simple: pick two bases, and let each one do what it does best.\n\nStart in Ubud. Three nights is enough for the rice terraces, a waterfall morning, one temple and a slow café day. Book a stay with a valley view rather than one on the main road — the price difference is small and the mornings are completely different.\n\nThen move south. Seminyak or Nusa Dua, depending on whether you want beach clubs or calm water. Keep one full day free for Nusa Penida, which needs an early start, and one entirely empty. That empty day is the one people remember.\n\nOn budget: mid-range Bali is genuinely affordable, but transfers add up. Pre-booking a car with a driver for the full day usually costs less than three separate app rides, and you are not negotiating in the sun each time.	5f96a70d-1cdd-4ba8-bbb5-c6b4a9e374e7-bali-C-ZvmxxP.jpg	\N	PUBLISHED	2026-08-21 07:01:31.39	2026-08-21 07:01:31.397	2026-08-21 07:01:31.397	Travel Guides	Two bases, four highlights and enough unscheduled time to actually enjoy the island.	6
8f022a9f-9f46-4edb-90dc-f303d1d43cf0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	How to choose a Maldives resort without overpaying	maldives-resort-choice	The resort you choose in the Maldives decides your entire trip, because you cannot casually change islands. Three things drive both cost and experience: how you get there, what you eat, and what is under the water outside your villa.\n\nSpeedboat resorts are cheaper to reach and let you arrive at any hour. Seaplane resorts are further out, more scenic and add a significant per-person cost — and they only fly in daylight.\n\nOn meals, half board is the sweet spot for most couples. All-inclusive only pays off if you drink, or if the resort is far from any alternative.\n\nFinally, ask about the house reef. A resort with a good one gives you a free activity every single day. Without it, snorkelling becomes a paid excursion every time.	7c7076d8-5589-4bd2-b23d-0a75676db41b-maldives-DgCIoG22.jpg	\N	PUBLISHED	2026-08-21 07:01:31.411	2026-08-21 07:01:31.416	2026-08-21 07:01:31.416	Honeymoon	Transfer type, meal plan and house reef quality matter more than the star rating.	5
e579e373-3341-4d83-b77c-5b9e5d346130	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Schengen visa: the document checklist people get wrong	schengen-visa-checklist	Schengen rejections are rarely about money. They are usually about documents that do not agree with each other — dates on the itinerary that do not match the hotel booking, or a cover letter that describes a different route.\n\nKeep one master itinerary and build every other document from it. Flights, hotels, insurance and the cover letter should all show the same entry date, exit date and cities.\n\nSix months of bank statements should show a steady balance, not a large deposit landing a week before the appointment. If someone is sponsoring the trip, their documents need to be complete too.\n\nApply early. In summer, appointment slots disappear faster than the processing time itself, and travel plans built around a tight visa window are stressful for everyone.	d1b423a7-4b7d-4442-b597-eb37205fd02b-europe.jpg	\N	PUBLISHED	2026-08-21 07:01:31.438	2026-08-21 07:01:31.443	2026-08-21 07:01:31.443	Visa	Bank statements, cover letters and the booking proofs that actually get accepted.	7
85587a3b-5675-498a-a4ba-59dcc5c8fc10	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Planning a family trip that works for three generations	family-travel-pace	Multi-generation trips fail on pace, not on destination. Grandparents need shorter days, children need earlier meals, and everyone needs a place to sit down.\n\nChoose one hotel and do day trips from it wherever possible. Repacking every second night is the single fastest way to exhaust a family group.\n\nBook the big attraction on day two, not day one. Jet lag and travel fatigue on the first day turn a great experience into a queue.\n\nFinally, check food. Easy vegetarian access, familiar breakfast options and a kettle in the room solve more problems than an extra star of hotel rating.	3aafe5b1-6f36-46d4-93b2-067c3855d131-singapore-D61jditK.jpg	\N	PUBLISHED	2026-08-21 07:01:31.453	2026-08-21 07:01:31.459	2026-08-21 07:01:31.459	Family Travel	Pace, proximity and food access decide whether everyone enjoys the holiday.	5
e1e803d6-02ea-46f3-a698-acc56f52cfe4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	When to travel to Southeast Asia, month by month	best-time-southeast-asia	Southeast Asia does not have one season. Thailand's west coast and east coast peak at different times, and Vietnam runs almost 2,000 kilometres north to south with three separate climates.\n\nNovember to March is the safe window for Thailand's Andaman side, Bali and most of Vietnam. That is also when prices are highest, so book earlier than you think you need to.\n\nThe shoulder months — April, May, October — often give you 80% of the weather at 60% of the cost. Rain in these months tends to arrive in short, heavy bursts rather than all day.\n\nIf your dates are fixed and they fall in the wet season, change the destination, not the plan. There is almost always a nearby island or region that is dry that month.	66107ef1-4dca-46bf-97ef-67441618a134-thailand-C2yi6qi_.jpg	\N	PUBLISHED	2026-08-21 07:01:31.47	2026-08-21 07:01:31.475	2026-08-21 07:01:31.475	Destinations	A practical seasonality guide for Thailand, Bali, Vietnam and Malaysia.	6
d57624cb-d577-40b3-a33d-6af3c9856add	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Himachal beyond Manali: routes worth the extra drive	adventure-himachal	Manali is easy and it is busy. If you have seven days and tolerance for mountain roads, the valleys on either side of it are a different holiday altogether.\n\nTirthan is the gentlest option — trout streams, forest walks and homestays, roughly two hours off the main highway.\n\nSpiti needs acclimatisation and a plan. Go via Shimla and return via Manali once the pass opens, never the reverse in a hurry.\n\nChitkul, at the end of the Sangla valley, is a single-road village with a view that justifies the drive. Carry cash and expect patchy network.	f9617784-30ab-4935-9eb3-788f77c7d439-himachal-pradesh.jpg	\N	PUBLISHED	2026-08-21 07:01:31.487	2026-08-21 07:01:31.492	2026-08-21 07:01:31.492	Adventure	Tirthan, Spiti and Chitkul for travellers who want quiet over convenience.	6
\.


--
-- Data for Name: booking_status_history; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.booking_status_history (id, "bookingId", "fromStatus", "toStatus", "changedByAdminId", "changedAt", note) FROM stdin;
614621b7-4f5d-43f4-8036-66fb9b85d475	166c002e-e168-448d-91f9-8f96d5609783	\N	DRAFT	20b6c891-02d1-43ab-9ee4-65372be811b2	2026-08-11 09:35:13.527	Booking created
27c15c50-40b5-4af9-a329-7af2675f3ad1	166c002e-e168-448d-91f9-8f96d5609783	DRAFT	CONFIRMED	20b6c891-02d1-43ab-9ee4-65372be811b2	2026-08-11 09:35:14.428	Payment received in full
47564844-1d1b-4bbf-bc5d-57f47f431ad3	219d94a8-f7a8-443b-8a80-eec44c7f289d	\N	DRAFT	\N	2026-08-11 12:16:36.59	Booking created
4cc61b1e-5849-4049-ab1e-0178d41aa3d5	219d94a8-f7a8-443b-8a80-eec44c7f289d	DRAFT	CONFIRMED	\N	2026-08-11 12:16:46.966	Auto-confirmed after payment
76b05712-c898-4a80-8f56-e731f0ee43b0	219d94a8-f7a8-443b-8a80-eec44c7f289d	CONFIRMED	CANCELLED	20b6c891-02d1-43ab-9ee4-65372be811b2	2026-08-11 12:18:12.202	Cancelled via customer cancellation request
\.


--
-- Data for Name: booking_travelers; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.booking_travelers ("bookingId", "travelerId") FROM stdin;
166c002e-e168-448d-91f9-8f96d5609783	1aa4abe6-92ed-44b4-9d01-fea874c79a32
166c002e-e168-448d-91f9-8f96d5609783	8cad87f9-dab8-414b-9045-5bf6d92a1ffb
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.bookings (id, "tenantId", "customerId", "packageId", "consultantId", status, "paymentStatus", "totalAmount", currency, "travelStartDate", "travelEndDate", "createdAt", "updatedAt") FROM stdin;
166c002e-e168-448d-91f9-8f96d5609783	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	5515c807-08fe-4d19-b467-c02264cce0f7	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	20b6c891-02d1-43ab-9ee4-65372be811b2	CONFIRMED	PARTIAL	95000.00	INR	2026-12-20 00:00:00	2026-12-24 00:00:00	2026-08-11 09:35:13.509	2026-08-11 10:30:13.524
219d94a8-f7a8-443b-8a80-eec44c7f289d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	df5b2d4b-88ee-4ed8-a78a-101e995204ad	82e2fc31-77dc-4c33-b1ba-202048ac14c2	\N	CANCELLED	PAID	19999.00	INR	\N	\N	2026-08-11 12:16:36.507	2026-08-11 12:18:12.205
\.


--
-- Data for Name: cancellation_requests; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.cancellation_requests (id, "bookingId", "customerId", reason, status, "requestedAt", "resolvedAt", "resolutionNote") FROM stdin;
11ed285d-b91c-4183-8071-49d585e7558d	219d94a8-f7a8-443b-8a80-eec44c7f289d	df5b2d4b-88ee-4ed8-a78a-101e995204ad	Change of plans	APPROVED	2026-08-11 12:17:00.704	2026-08-11 12:18:12.19	\N
\.


--
-- Data for Name: consultants; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.consultants (id, "adminUserId", "targetRevenue", "activeLeadCount") FROM stdin;
cb078059-80e8-4933-8b90-9ceb727e0dd1	20b6c891-02d1-43ab-9ee4-65372be811b2	500000.00	0
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.countries (id, name, iso2, region) FROM stdin;
9cac769d-1711-4dfb-984b-c23db1b7ddba	India	IN	India
fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	Thailand	TH	Asia
1c5c825e-ba41-4bf9-a15b-caa9b04f305d	Indonesia	ID	Asia
6dfc27c2-1f08-46fb-b3c9-5fc166cbcbde	United Arab Emirates	AE	Middle East
41f88819-174f-4932-a283-11569951c20a	Singapore	SG	Asia
1f75f43e-cbe1-41f0-8cf0-3cd080586511	Vietnam	VN	Asia
c6d88296-0db9-401c-a25d-08694f5ff6b2	Maldives	MV	Indian Ocean
f62c9849-c9ed-4836-a657-db755502a035	Malaysia	MY	Asia
4af9d23d-1fdd-46d9-94ea-e40837863259	Japan	JP	Asia
d64f23b4-8684-41e0-b0e3-739bf0c30a7a	Switzerland	CH	Europe
260f1c6c-0987-4101-be33-00795c9e95ed	Sri Lanka	LK	Asia
3a0819ff-2ceb-49b9-9605-2de701abd818	Mauritius	MU	Indian Ocean
2b1ac0d6-fdfe-4e8c-9076-0fc317a82301	Bhutan	BT	Asia
9cf6cf88-e6d2-4047-a349-1d394af954ac	Europe	EU	Europe
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.coupons (id, "tenantId", code, description, "discountType", value, "minBookingAmount", "maxDiscountAmount", "destinationId", "validFrom", "validTo", "usageLimit", "usageCount", "isActive", "createdAt") FROM stdin;
79020ee0-165e-4ed0-b82b-bf244835743c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	PHUKET15	\N	PERCENT	15.00	\N	\N	bdd09d56-d5b9-4934-81f4-66ca7c90a58c	2026-08-01 00:00:00	2026-12-31 00:00:00	100	0	t	2026-08-11 07:33:59.615
\.


--
-- Data for Name: customer_documents; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.customer_documents (id, "customerId", "travelerId", "docType", "storageKey", "verifiedAt", "createdAt") FROM stdin;
39a03b9b-1e0a-442f-8f03-a858086e0b0a	5515c807-08fe-4d19-b467-c02264cce0f7	1aa4abe6-92ed-44b4-9d01-fea874c79a32	Passport	5a1d65d3-efdf-4ed7-8bcb-baddb0844f07-pixel.png	\N	2026-08-11 09:34:54.254
\.


--
-- Data for Name: customer_refresh_tokens; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.customer_refresh_tokens (id, "customerId", "tokenHash", "expiresAt", "revokedAt", "replacedBy", "createdAt") FROM stdin;
74f0018f-9e38-4c86-96ca-5486a71e9efe	df5b2d4b-88ee-4ed8-a78a-101e995204ad	4192453c64eff95db812734d61d3a4a69a6ceb404c9d1e1784091687aceb80e8	2026-09-10 12:16:27.11	\N	\N	2026-08-11 12:16:27.115
cd422b60-55ad-4a95-bbdd-d42185eaab93	b0dba729-09fe-4a6e-ad8c-7849c389cca8	73e8bdde4b8e32d6f8f1c0092fb46eada8169787517a8394430c99a8fae5c9c8	2026-09-10 12:19:38.637	\N	\N	2026-08-11 12:19:38.639
9373b4e4-d6f2-4da1-bd1f-dba2c947353b	8212c5dd-798f-4f0a-88f5-f050e164a174	a56cbc0e3411e8cb3b24c8575ae1ff4a56069321e306f161ea7e6216df5fa465	2026-09-10 12:20:38.059	\N	\N	2026-08-11 12:20:38.06
5f8b15f7-477b-4d44-a175-597ed4bf5a2c	8212c5dd-798f-4f0a-88f5-f050e164a174	66bb6b42e1edd3b7fd64be722da30db0e8251d704ca28f0a3d4b0d0e2020590d	2026-09-10 12:20:37.304	2026-08-11 12:20:38.507	bd9f8292f60e741636a4a985637146ac70a662067a0c957a1ed6435659e1219d	2026-08-11 12:20:37.305
9a545383-b351-49fb-a316-7e9a195a1fb8	8212c5dd-798f-4f0a-88f5-f050e164a174	bd9f8292f60e741636a4a985637146ac70a662067a0c957a1ed6435659e1219d	2026-09-10 12:20:38.505	2026-08-11 12:20:38.639	\N	2026-08-11 12:20:38.506
bf40b84c-3b46-428b-81ea-50193f36e645	62b1fad1-bacf-4efa-8b54-e48a3b85c684	38f34e4359f30c6429944de0c27163d631b37f2680702416f22f506660d61ce9	2026-09-10 12:21:34.051	\N	\N	2026-08-11 12:21:34.052
6bf24507-9d66-48a3-9770-4356a94862a3	e491771b-8cda-4aa0-a4ed-00d5e8162d6a	fb89b9b82ff2e8025ec6788acd554f767cbc68be6673c27e151b76c3b733ec62	2026-09-11 06:26:48.972	\N	\N	2026-08-12 06:26:48.973
deefac9b-9327-49f8-95fd-d96a347e133c	f5bb9878-e809-41d0-b37f-e174ae6b29cd	7b9ac05480e48b60daf8b771569bcb45f417fde26c33a782443fbb4fa97df165	2026-09-11 07:51:36.595	\N	\N	2026-08-12 07:51:36.597
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.customers (id, "tenantId", name, email, phone, "createdAt", "emailVerifiedAt", "passwordHash", "phoneVerifiedAt", status) FROM stdin;
5515c807-08fe-4d19-b467-c02264cce0f7	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Anita Sharma	anita.sharma@example.com	9876543210	2026-08-11 09:34:53.003	\N	\N	\N	ACTIVE
df5b2d4b-88ee-4ed8-a78a-101e995204ad	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Traveler	9876500001@otp.paxbook.local	9876500001	2026-08-11 12:16:27.093	\N	\N	2026-08-11 12:16:27.087	ACTIVE
b0dba729-09fe-4a6e-ad8c-7849c389cca8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Traveler	9876500002@otp.paxbook.local	9876500002	2026-08-11 12:19:38.635	\N	\N	2026-08-11 12:19:38.633	ACTIVE
8212c5dd-798f-4f0a-88f5-f050e164a174	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Nisha Brosis	nisha.test@example.com	9876500099	2026-08-11 12:20:37.251	\N	$argon2id$v=19$m=65536,t=3,p=4$H66v0sJE35A24/YpqIqFWA$n/XkVmdjrPElUsg2fI3+7BGSFyfrjw5SvZbNk/Nli/M	\N	ACTIVE
62b1fad1-bacf-4efa-8b54-e48a3b85c684	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Traveler	9876500051@otp.paxbook.local	9876500051	2026-08-11 12:21:34.049	\N	\N	2026-08-11 12:21:34.048	ACTIVE
e491771b-8cda-4aa0-a4ed-00d5e8162d6a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Traveler	9876511111@otp.paxbook.local	9876511111	2026-08-12 06:26:48.969	\N	\N	2026-08-12 06:26:48.968	ACTIVE
f5bb9878-e809-41d0-b37f-e174ae6b29cd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Traveler	9876522222@otp.paxbook.local	9876522222	2026-08-12 07:51:36.578	\N	\N	2026-08-12 07:51:36.575	ACTIVE
\.


--
-- Data for Name: destination_activities; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destination_activities (id, "destinationId", label, "sortOrder") FROM stdin;
82316106-bbf3-4eda-aef4-1b7475709c40	25534ce5-2b51-4471-9600-127036598b4b	Private pool villa stay	0
e4a0ec2d-a189-4b27-bae6-dbd525c7a31e	25534ce5-2b51-4471-9600-127036598b4b	Balinese spa evening	1
0f98c943-a5b8-4df5-8ae1-9be532181488	25534ce5-2b51-4471-9600-127036598b4b	Waterbom day pass	2
c1bf884e-576e-4fd1-9e3a-48148f72cfc2	25534ce5-2b51-4471-9600-127036598b4b	Candlelight dinner	3
d2219d4d-5720-42de-bd18-d521c92c10fa	f57f1a08-d092-407c-bc01-962f7328974f	Seaplane transfer	0
8232c6db-0dae-4c53-bab3-f0dffcf1dfc9	f57f1a08-d092-407c-bc01-962f7328974f	Floating breakfast	1
7fad05a8-dfae-4117-8a1c-5d87c757282e	f57f1a08-d092-407c-bc01-962f7328974f	Night fishing	2
c766f58a-8df3-4118-945c-1cd1f20c21ae	f57f1a08-d092-407c-bc01-962f7328974f	Scuba discovery dive	3
63494b67-0bff-4711-93aa-5070d90695fd	2824d140-2702-4a58-a0aa-6030c8134362	Desert safari with BBQ	0
4fee4903-e52b-45e1-9bb8-c3f1cae49daf	2824d140-2702-4a58-a0aa-6030c8134362	Aquaventure waterpark	1
7c376a05-8195-482e-a3c2-4966f47b37d3	2824d140-2702-4a58-a0aa-6030c8134362	Abu Dhabi day trip	2
25e716cd-71e0-4151-8569-c4d9bad16140	2824d140-2702-4a58-a0aa-6030c8134362	Dubai Frame	3
f5bf52aa-3634-45c5-afa6-6d4a30e6ee8f	eae20d80-da05-4a8c-8727-1886bcc7cf52	Speedboat island tour	0
6f3bba59-eb83-4ad1-aaec-f1f0a237afbb	eae20d80-da05-4a8c-8727-1886bcc7cf52	Thai cooking class	1
8810faf3-822d-4529-856d-adc927d6519e	eae20d80-da05-4a8c-8727-1886bcc7cf52	Elephant sanctuary visit	2
ffd3da16-829e-457b-80c9-28b17147121f	eae20d80-da05-4a8c-8727-1886bcc7cf52	Chao Phraya dinner cruise	3
610ed60f-3aac-47c0-b465-f93af22f4000	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Universal Studios	0
58fe56c8-bca9-4b94-ab42-35475e573b26	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Night Safari	1
95d695ea-0537-408d-8669-22240626b139	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Cable car to Sentosa	2
17ab26fc-5a4d-4d02-82fc-27e8843aca8e	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Hop-on hop-off pass	3
1553427a-fe77-4ee2-9656-4fc9338bb66b	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Overnight cruise cabin	0
267fbdce-352b-4ba9-b4ae-ea767a7c35e4	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Street food walk	1
5887d039-1732-42e1-8951-7396d0ffefe3	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Golden Bridge visit	2
075b3464-fe85-4576-b549-90e2bdb7d7f5	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Mekong delta boat	3
1f8b6b5a-eb4f-454c-8c92-dc75f472c9a6	2c239102-080c-4345-aa90-6f25024979fc	Sky Bridge cable car	0
f53ed671-a480-4191-bc90-e17146faeaff	2c239102-080c-4345-aa90-6f25024979fc	Island hopping boat	1
978b911f-ab4a-410c-9d62-5850002975e7	2c239102-080c-4345-aa90-6f25024979fc	Sunset cruise	2
3164a957-72f2-4e73-903a-1ff256109d4a	2c239102-080c-4345-aa90-6f25024979fc	KL city tour	3
1e63705e-c538-4a97-affc-32292d65a1ea	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	JR rail pass	0
54b185f3-f78e-467a-81f2-bd2a73d18409	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	teamLab tickets	1
a58c1bbd-9ee1-404b-8bbd-167fd5eee014	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Ryokan onsen night	2
cb187052-80b2-4fe6-a9e2-e6cd0c619eeb	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Sumo or kabuki evening	3
143ff07f-0411-422c-a3be-3cafb7dd9bcd	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Swiss Travel Pass	0
3668208b-d6fa-4202-873c-175d9f971b71	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Jungfraujoch excursion	1
cfd3ccd2-43ed-4146-9cd8-24ccbb3d7e45	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Paragliding	2
b15b2f9d-5ab4-4368-baae-5b87f090e45e	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Glacier Express leg	3
2cfc867d-7baf-4c87-86e1-7feb1682e593	b1763f26-0ed0-49a4-8490-80faafc6a155	Eurail segments	0
5ab153cc-f672-430c-8438-a703bc984b8b	b1763f26-0ed0-49a4-8490-80faafc6a155	Skip-the-line passes	1
e94d360a-1dca-40e6-96e2-505c9a5b585d	b1763f26-0ed0-49a4-8490-80faafc6a155	Seine dinner cruise	2
5041b9e5-3cdf-4a6d-a212-e4a62ba2e819	b1763f26-0ed0-49a4-8490-80faafc6a155	Gondola ride	3
973fde3b-4fd1-4f86-be9f-ff99ef67d328	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Desert camp night	0
de0a665f-a697-4133-84f9-8e44f66bd524	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Vintage car city tour	1
a42a9f48-f890-41db-811e-d8220252d95e	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Cooking session	2
25fb064c-0e27-4ba2-9612-6b4abb234bcf	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Folk dance evening	3
e79853ba-361c-4cdd-9954-2a55ba81f846	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Houseboat night	0
f50c7d18-9792-4fdf-aef7-8d9c93c067cd	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Ayurvedic massage	1
f52045de-52e9-4844-8f30-e38685d4ff6c	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Spice plantation tour	2
6c10b3bf-e8f1-48ee-ac64-0b2f8a22f44b	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Kathakali show	3
c9ddddba-7ade-470b-bee5-9be298834d55	5849cc1d-988c-4310-b48d-7027c576718c	Paragliding	0
dfeb87a5-8f78-4357-9124-ea4fa9512dea	5849cc1d-988c-4310-b48d-7027c576718c	River rafting	1
48c68408-58d0-45c6-a797-e0538d5d1418	5849cc1d-988c-4310-b48d-7027c576718c	Snow point excursion	2
d1169a55-5534-4de0-bb09-966dd9ec6c0f	5849cc1d-988c-4310-b48d-7027c576718c	Bonfire evening	3
e79d4847-b0d3-4a98-9071-b579f84b66d2	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Water sports combo	0
31d73335-f493-48af-9960-2d38b9a7989c	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Sunset cruise	1
9042f661-209f-43f2-ac5a-8eb044ebb5dd	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Spice farm lunch	2
5d3cd6f0-16e8-49ea-bdfc-f5c4a5ac1c45	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Scooter rental	3
cc08f21f-5446-499d-9b97-56c4e5461cd9	91a3d948-35d7-48c7-a608-cbfe92137834	Scenic train seats	0
e16da68b-4b3e-452b-9b66-29b33ab4d473	91a3d948-35d7-48c7-a608-cbfe92137834	Yala safari jeep	1
87730827-b7b6-4d34-bbf0-b3988b73c7e1	91a3d948-35d7-48c7-a608-cbfe92137834	Tea factory visit	2
373e6602-0172-4d3b-accf-816f258f7280	91a3d948-35d7-48c7-a608-cbfe92137834	Whale watching (seasonal)	3
cef5c7c9-f3c7-48f7-8b4c-f2a96e620d5d	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Catamaran cruise	0
39fa5422-1cd2-4d61-a15b-6ce251735490	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Underwater sea walk	1
88e88b37-5f51-4025-924e-35a657b5ea6f	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Quad biking	2
fb929871-4574-4706-a09b-e1a46a6031f4	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Dolphin watching	3
fa998d90-e0f0-41ef-a3e2-d69ced38cbc4	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Tiger's Nest trek	0
0474fce8-b325-4c5f-b0a0-dd088bc464ce	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Hot stone bath	1
79178edd-1316-42e4-825e-ee4c75570216	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Archery session	2
393975e2-40f7-4214-a4f2-3f30767215cd	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Monastery blessing	3
\.


--
-- Data for Name: destination_categories; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destination_categories (id, name) FROM stdin;
deadc838-daff-4924-9b00-d24b6b59d6d1	Theme
9b8a1f4d-1a76-49d4-8500-8d246813b537	Honeymoon
df40891d-c721-4f69-b045-980aec5875c3	Family
a5a0615a-980c-41c9-9855-88647ddd4a59	Adventure
33a94a3b-5ae3-4cca-9ba6-e356edd63fcc	Seasonal
9708d859-30cf-40ee-b4a6-54f461311cde	Budget
1706ce37-c954-4cf1-8c82-2bbdc673824c	Luxury
6882361d-c3c3-4338-834d-ff17694a4d3a	Couple
def0ffff-ee95-40c0-b756-c81c997b5723	Friends
692c3aa0-b876-4864-93d3-626d3b8fbcc5	Group
e6c26e10-c9bb-4b80-8266-48ce1b6c5538	Corporate
\.


--
-- Data for Name: destination_category_map; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destination_category_map ("destinationId", "categoryId") FROM stdin;
bdd09d56-d5b9-4934-81f4-66ca7c90a58c	9b8a1f4d-1a76-49d4-8500-8d246813b537
5849cc1d-988c-4310-b48d-7027c576718c	a5a0615a-980c-41c9-9855-88647ddd4a59
5849cc1d-988c-4310-b48d-7027c576718c	9708d859-30cf-40ee-b4a6-54f461311cde
5849cc1d-988c-4310-b48d-7027c576718c	def0ffff-ee95-40c0-b756-c81c997b5723
e1dc567d-b762-40ec-9075-60e04b80cc38	df40891d-c721-4f69-b045-980aec5875c3
e1dc567d-b762-40ec-9075-60e04b80cc38	a5a0615a-980c-41c9-9855-88647ddd4a59
e1dc567d-b762-40ec-9075-60e04b80cc38	692c3aa0-b876-4864-93d3-626d3b8fbcc5
e1dc567d-b762-40ec-9075-60e04b80cc38	e6c26e10-c9bb-4b80-8266-48ce1b6c5538
521f62bf-b68e-4e85-a81c-f31eaba6d672	9b8a1f4d-1a76-49d4-8500-8d246813b537
521f62bf-b68e-4e85-a81c-f31eaba6d672	9708d859-30cf-40ee-b4a6-54f461311cde
521f62bf-b68e-4e85-a81c-f31eaba6d672	6882361d-c3c3-4338-834d-ff17694a4d3a
bdc843b8-9513-4c69-aba3-1f566b02bb8b	1706ce37-c954-4cf1-8c82-2bbdc673824c
bdc843b8-9513-4c69-aba3-1f566b02bb8b	df40891d-c721-4f69-b045-980aec5875c3
bdc843b8-9513-4c69-aba3-1f566b02bb8b	def0ffff-ee95-40c0-b756-c81c997b5723
bdc843b8-9513-4c69-aba3-1f566b02bb8b	692c3aa0-b876-4864-93d3-626d3b8fbcc5
bb27ab5f-429d-4e57-865e-a69f2a4e7c35	df40891d-c721-4f69-b045-980aec5875c3
bb27ab5f-429d-4e57-865e-a69f2a4e7c35	9b8a1f4d-1a76-49d4-8500-8d246813b537
bb27ab5f-429d-4e57-865e-a69f2a4e7c35	6882361d-c3c3-4338-834d-ff17694a4d3a
25534ce5-2b51-4471-9600-127036598b4b	9b8a1f4d-1a76-49d4-8500-8d246813b537
25534ce5-2b51-4471-9600-127036598b4b	6882361d-c3c3-4338-834d-ff17694a4d3a
f57f1a08-d092-407c-bc01-962f7328974f	9b8a1f4d-1a76-49d4-8500-8d246813b537
f57f1a08-d092-407c-bc01-962f7328974f	1706ce37-c954-4cf1-8c82-2bbdc673824c
2824d140-2702-4a58-a0aa-6030c8134362	df40891d-c721-4f69-b045-980aec5875c3
2824d140-2702-4a58-a0aa-6030c8134362	1706ce37-c954-4cf1-8c82-2bbdc673824c
2824d140-2702-4a58-a0aa-6030c8134362	def0ffff-ee95-40c0-b756-c81c997b5723
eae20d80-da05-4a8c-8727-1886bcc7cf52	def0ffff-ee95-40c0-b756-c81c997b5723
eae20d80-da05-4a8c-8727-1886bcc7cf52	9708d859-30cf-40ee-b4a6-54f461311cde
eae20d80-da05-4a8c-8727-1886bcc7cf52	a5a0615a-980c-41c9-9855-88647ddd4a59
f0826aab-9c60-41d2-82e2-dd2f9bff7902	df40891d-c721-4f69-b045-980aec5875c3
f0826aab-9c60-41d2-82e2-dd2f9bff7902	e6c26e10-c9bb-4b80-8266-48ce1b6c5538
d487d421-1b6a-47af-aa02-a06fd7a09dfc	a5a0615a-980c-41c9-9855-88647ddd4a59
d487d421-1b6a-47af-aa02-a06fd7a09dfc	6882361d-c3c3-4338-834d-ff17694a4d3a
2c239102-080c-4345-aa90-6f25024979fc	9b8a1f4d-1a76-49d4-8500-8d246813b537
2c239102-080c-4345-aa90-6f25024979fc	df40891d-c721-4f69-b045-980aec5875c3
42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	1706ce37-c954-4cf1-8c82-2bbdc673824c
42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	6882361d-c3c3-4338-834d-ff17694a4d3a
42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	33a94a3b-5ae3-4cca-9ba6-e356edd63fcc
7a9762e6-cd0b-4b22-ad78-4c624be6e155	a5a0615a-980c-41c9-9855-88647ddd4a59
7a9762e6-cd0b-4b22-ad78-4c624be6e155	1706ce37-c954-4cf1-8c82-2bbdc673824c
f1ef1bdf-306d-44dd-a054-a05e55df3cf4	def0ffff-ee95-40c0-b756-c81c997b5723
f1ef1bdf-306d-44dd-a054-a05e55df3cf4	9708d859-30cf-40ee-b4a6-54f461311cde
91a3d948-35d7-48c7-a608-cbfe92137834	a5a0615a-980c-41c9-9855-88647ddd4a59
91a3d948-35d7-48c7-a608-cbfe92137834	df40891d-c721-4f69-b045-980aec5875c3
cc596d4f-32a8-47d5-8eed-9d08e6fb7add	9b8a1f4d-1a76-49d4-8500-8d246813b537
cc596d4f-32a8-47d5-8eed-9d08e6fb7add	1706ce37-c954-4cf1-8c82-2bbdc673824c
90f47cdf-17e9-4949-a4f6-3eeba777ed7f	a5a0615a-980c-41c9-9855-88647ddd4a59
90f47cdf-17e9-4949-a4f6-3eeba777ed7f	33a94a3b-5ae3-4cca-9ba6-e356edd63fcc
\.


--
-- Data for Name: destination_highlights; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destination_highlights (id, "destinationId", title, description, "sortOrder") FROM stdin;
0fb45731-30fa-4ef6-94f2-b9be12de1895	25534ce5-2b51-4471-9600-127036598b4b	Ubud rice terraces	Sunrise walk through Tegallalang followed by a jungle breakfast.	0
15a8ea36-7a40-4940-8d40-8c0fd97d4aaf	25534ce5-2b51-4471-9600-127036598b4b	Nusa Penida day trip	Kelingking cliff, snorkelling stops and a speedboat crossing.	1
3c6a127c-deaf-473f-a263-78521e80dd93	25534ce5-2b51-4471-9600-127036598b4b	Uluwatu sunset	Cliff temple, Kecak fire dance and a seafood dinner on the sand.	2
fa89171b-e6a1-4353-8ec3-c57ac0a93939	25534ce5-2b51-4471-9600-127036598b4b	Waterfall trail	Tegenungan and Tibumana with a local guide and private transfers.	3
537d35d4-d2e8-4189-87fb-03a9cabf2a48	f57f1a08-d092-407c-bc01-962f7328974f	House reef snorkelling	Step off your villa deck into a living coral garden.	0
088b151f-a276-481f-8a51-d5586d3d90d0	f57f1a08-d092-407c-bc01-962f7328974f	Sandbank picnic	Private boat drop to an empty sandbank with a packed lunch.	1
86c1be85-5fa1-4824-a1a6-1a4b19c0980f	f57f1a08-d092-407c-bc01-962f7328974f	Sunset dolphin cruise	An hour on the water as pods cross the atoll.	2
89789708-f791-4e78-b4be-dbbbb8f53605	f57f1a08-d092-407c-bc01-962f7328974f	Overwater spa	Couples treatment with a glass floor over the lagoon.	3
579161f5-3f7e-48fd-ba17-cb67735cda60	2824d140-2702-4a58-a0aa-6030c8134362	Burj Khalifa levels 124/125	Timed-entry tickets, ideally at sunset.	0
aa5c6c18-1c6c-4338-8cd3-238fdd4ac23e	2824d140-2702-4a58-a0aa-6030c8134362	Desert safari	Dune drive, camel ride and a dinner camp under the stars.	1
db50ee80-ae18-4700-bd77-05e24d9fc59d	2824d140-2702-4a58-a0aa-6030c8134362	Dhow cruise, Dubai Marina	Buffet dinner with the skyline lit up.	2
b4024c4a-a01c-45fe-b7df-a77b5c0eb099	2824d140-2702-4a58-a0aa-6030c8134362	Museum of the Future	One of the city's best indoor mornings.	3
7da251c5-6fa5-4f09-9562-d5a9daea28b3	eae20d80-da05-4a8c-8727-1886bcc7cf52	Phi Phi islands by speedboat	Maya Bay viewpoint, snorkel stops and a beach lunch.	0
2fc754f7-05bb-43a7-ad39-40a8a329666c	eae20d80-da05-4a8c-8727-1886bcc7cf52	James Bond island, Phang Nga	Sea canoeing through limestone caves.	1
626b726f-5177-44cd-b121-58b01589ec69	eae20d80-da05-4a8c-8727-1886bcc7cf52	Bangkok temples	Grand Palace and Wat Arun with a river ferry crossing.	2
be16fbf0-b23a-44af-b606-4d2726073cac	eae20d80-da05-4a8c-8727-1886bcc7cf52	Floating market morning	Damnoen Saduak with a longtail boat ride.	3
a7c3c855-21ef-47bc-9bab-c2eaac33a37d	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Universal Studios Sentosa	Full-day park with express options.	0
1cb9c4a9-7539-4f95-b0d0-d25bbf24e684	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Gardens by the Bay	Cloud Forest, Flower Dome and the evening light show.	1
fefe5b5d-4928-47aa-98d7-38eff9124b36	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Singapore Zoo & River Wonders	Best done as a half-day morning.	2
80b00e06-9484-4a35-968c-3ca9879888e3	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Marina Bay Sands SkyPark	City panorama at dusk.	3
8012be47-3b7b-4b3b-ae27-7e3745b82937	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Ha Long Bay overnight cruise	Cabin on the water, kayaking and a cave stop.	0
3682ca2a-0eba-4df8-833a-4b2af4ecc488	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Hoi An old town	Lantern evening, tailoring and a riverside dinner.	1
25032d42-a071-4183-bd37-3aa6fce6dff4	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Cu Chi tunnels	Half-day history trip out of Ho Chi Minh City.	2
72400419-b53c-43c3-9247-9ec8a9dafbda	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Ba Na Hills	Cable car to the Golden Bridge.	3
86bc4651-3655-43a8-bc97-0918dd0df000	2c239102-080c-4345-aa90-6f25024979fc	Petronas Towers	Skybridge tickets and the KLCC park fountain show.	0
43bcaa9b-17c6-4f87-bf9a-2d5e08e179a3	2c239102-080c-4345-aa90-6f25024979fc	Langkawi Sky Bridge	Cable car through rainforest to the curved bridge.	1
6ab13adb-0001-4ffe-800b-3dada5be78ad	2c239102-080c-4345-aa90-6f25024979fc	Island hopping, Langkawi	Dayang Bunting lake and eagle feeding.	2
5e482de2-ff2f-406b-bdbd-7c06c8e853b2	2c239102-080c-4345-aa90-6f25024979fc	Batu Caves	Colourful steps and a short morning trip from KL.	3
4e8b35a0-d501-44ae-9284-82ef92054b70	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Kyoto temple trail	Fushimi Inari at dawn, Arashiyama bamboo by mid-morning.	0
67e4ab42-4d7e-426a-b647-3341fb1635d8	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Shinkansen to Osaka	Reserved seats and a food crawl in Dotonbori.	1
6f7ae321-6d1c-42b5-bb8c-ba2e62b0a99f	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Mount Fuji day	Lake Kawaguchi views and a ropeway ride.	2
d5c896e8-5b68-4daa-9efb-5357a670ab7d	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Tokyo neighbourhoods	Shibuya, Asakusa and teamLab.	3
fbdc943c-131d-40b2-a50c-d092356479a7	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Jungfraujoch	Top of Europe by cogwheel train.	0
121e068c-1389-44fc-93b2-1e3ce9a9280f	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Lake Lucerne cruise	Boat plus Mount Pilatus golden round trip.	1
675b15f2-bd79-4f29-a6d4-1274d50402e0	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Interlaken paragliding	Twenty minutes over the twin lakes.	2
4996fbea-55cf-4b13-b331-5f2fd4a49a12	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Zermatt & Matterhorn	Gornergrat railway on a clear morning.	3
6c842751-28ab-4d1a-b659-f09297ad3619	b1763f26-0ed0-49a4-8490-80faafc6a155	Paris in two days	Eiffel summit, Seine cruise and a Louvre morning.	0
10a1f554-af39-40e1-83ea-f79faedc54a8	b1763f26-0ed0-49a4-8490-80faafc6a155	Amsterdam canals	Canal cruise plus a Zaanse Schans half day.	1
0cf030ca-2820-4399-a401-2a49162d974b	b1763f26-0ed0-49a4-8490-80faafc6a155	Rome & Vatican	Skip-the-line Colosseum and Vatican Museums.	2
682a832c-8723-48f8-a88c-ec3010d429a2	b1763f26-0ed0-49a4-8490-80faafc6a155	Venice	Gondola ride and a Murano glass workshop.	3
51970f30-413c-44db-af1d-e6c0187e1ce5	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Udaipur lake palaces	City Palace, boat ride and a rooftop dinner.	0
6128fcb4-ce1b-4244-9576-867851acbcfc	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Jaisalmer desert camp	Dune sunset, folk music and a night under the stars.	1
147ceff0-296e-405c-8bc3-6b4a13b13c4f	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Mehrangarh Fort	Jodhpur's blue city from the ramparts.	2
887f0259-e9e7-491a-8c93-93aae5aae312	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Amber Fort, Jaipur	Morning visit before the crowds build.	3
6a76a793-9b2e-4410-a090-9578ec5d47d1	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Alleppey houseboat	Overnight on the backwaters with onboard meals.	0
61154fa8-92b9-4c18-8d58-bdbe8f0634c5	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Munnar tea estates	Plantation walk and the tea museum.	1
56ca05d3-6b0b-43be-84a8-6ac802a64d2a	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Periyar wildlife	Early boat safari on the lake.	2
8f9ea3c1-c0b2-4c94-8830-f2deded34d19	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Fort Kochi	Chinese fishing nets and a Kathakali evening.	3
c4c29856-2767-472e-8b9c-ac5f4fab72a7	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Tiger's Nest hike	Four to five hours return from the Paro valley floor.	0
9c0a7d49-787d-4740-aa6b-4d5cad0a29f4	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Punakha Dzong	River confluence and the suspension bridge.	1
4a965843-c949-4d3a-aca6-6b0d30c3c0b6	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Dochula Pass	108 chortens with a Himalayan skyline on clear days.	2
5452a338-0a7a-4dab-8de5-f84a32d0d6c1	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Thimphu markets	Weekend crafts and a national museum visit.	3
c95720b2-258b-41c0-ad3a-334eed1fd885	5849cc1d-988c-4310-b48d-7027c576718c	Solang Valley	Snow activities in winter, paragliding in summer.	0
c0538f20-4b51-4a36-9b1e-3bf94966c5e1	5849cc1d-988c-4310-b48d-7027c576718c	Atal Tunnel & Sissu	Day trip into the Lahaul valley.	1
fbd7985e-1d8f-4d4e-b017-565b369647f9	5849cc1d-988c-4310-b48d-7027c576718c	Old Manali cafés	Slow mornings by the river.	2
9599bfc8-72ac-48db-be37-6f0261de816e	5849cc1d-988c-4310-b48d-7027c576718c	Shimla ridge walk	Colonial-era mall road and toy train.	3
b01ca749-91db-43e7-ad8b-8563ef27242d	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Sunset at Anjuna	Cliffside cafés and a flea market afternoon.	0
ab56c8dd-34b1-42f1-a337-9479e939dd97	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Old Goa churches	Basilica of Bom Jesus and Se Cathedral.	1
cea70705-9204-41d1-b51b-a5cb1b8f7dbf	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Dudhsagar falls	Jeep safari through the Mollem forest.	2
b74572b3-7bfc-4e18-92ec-466cba226196	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	South Goa beaches	Palolem and Agonda, far quieter than the north.	3
0972bb78-3833-4fa4-9407-948cce189314	91a3d948-35d7-48c7-a608-cbfe92137834	Kandy to Ella train	One of the world's great rail journeys.	0
6b22c356-3dd7-4618-a065-fbe94e799dad	91a3d948-35d7-48c7-a608-cbfe92137834	Yala safari	Morning jeep drive for leopards and elephants.	1
d51a6764-9a5e-493d-941d-06a30d755e5c	91a3d948-35d7-48c7-a608-cbfe92137834	Sigiriya rock	Early climb before the heat.	2
c05e9f9b-f675-4fcc-8209-94fe00514e3f	91a3d948-35d7-48c7-a608-cbfe92137834	Galle Fort	Rampart walk at sunset.	3
d7a0bac2-d5c1-4924-abf3-51a9dc5554b3	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Île aux Cerfs	Speedboat day trip with a beach barbecue.	0
613d87a8-830d-4317-ad19-72187adddf5c	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Chamarel	Seven coloured earths and the waterfall viewpoint.	1
91a843bc-7f85-421c-b65a-780bef4aec21	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Blue Bay catamaran	Snorkelling in the marine park.	2
dfe17656-c582-4c44-8d37-6369c6368c56	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Port Louis market	Street food and local crafts.	3
\.


--
-- Data for Name: destination_hotel_suggestions; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destination_hotel_suggestions (id, "destinationId", name, "starRating", area, descriptor, "sortOrder") FROM stdin;
14956ea1-078f-4862-8417-31da9557ab1f	f57f1a08-d092-407c-bc01-962f7328974f	Lagoon Water Villa Resort	5	South Malé Atoll	\N	0
8960345d-0d5f-4a70-9f6d-ef0d20c47f0c	f57f1a08-d092-407c-bc01-962f7328974f	Reef Beach Villas	4	North Malé Atoll	\N	1
b9f8b2ce-bc36-4cdb-89d5-242214927156	f57f1a08-d092-407c-bc01-962f7328974f	Atoll Premium Retreat	5	Baa Atoll	\N	2
b83963ea-c5f3-40c9-a406-e7420fc0ffa4	2824d140-2702-4a58-a0aa-6030c8134362	Marina Skyline Hotel	4	Dubai Marina	\N	0
48710d67-487a-4fb1-b3c8-207355433fb0	2824d140-2702-4a58-a0aa-6030c8134362	Downtown Fountain View	5	Downtown	\N	1
2d69df70-7424-4ec5-bb4f-30ec74b2323a	2824d140-2702-4a58-a0aa-6030c8134362	Palm Beach Resort	5	Palm Jumeirah	\N	2
a492d742-a354-435b-b2f7-d37d4488bab9	eae20d80-da05-4a8c-8727-1886bcc7cf52	Patong Bay Hotel	4	Phuket	\N	0
932b6168-bf75-4779-aa56-38bf36512c92	eae20d80-da05-4a8c-8727-1886bcc7cf52	Krabi Cliffside Resort	4	Krabi	\N	1
41b85a2b-6cb0-49d1-8f90-3aeb0b6f809b	eae20d80-da05-4a8c-8727-1886bcc7cf52	Sukhumvit City Hotel	4	Bangkok	\N	2
cf0d67df-6241-4800-85a6-dafdd8e8ad83	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Clarke Quay Riverside	4	Clarke Quay	\N	0
06a5ece7-9eac-4c50-8d42-7ab3d73d7922	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Orchard Central Hotel	4	Orchard	\N	1
33953640-27af-4e37-8c85-971581e516d9	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Sentosa Island Resort	5	Sentosa	\N	2
ac212faf-b77c-4da1-bf49-d42508f4fd7b	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Hanoi Old Quarter Hotel	4	Hanoi	\N	0
3953a6a8-a929-409a-8c52-6f99cd10c0a0	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Da Nang Beachfront	4	Da Nang	\N	1
73270edf-2c6b-4433-b3f2-fb27b53d6fa3	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Ha Long Deluxe Cruise	4	Ha Long Bay	\N	2
1860f3c6-8318-4eb2-aa02-39475cee6646	2c239102-080c-4345-aa90-6f25024979fc	Bukit Bintang City Hotel	4	Kuala Lumpur	\N	0
dc69a05c-4b09-4e2f-96d9-cb5e99606cd2	2c239102-080c-4345-aa90-6f25024979fc	Pantai Cenang Resort	4	Langkawi	\N	1
7f579612-0dc4-4548-aa2f-24dda1bf23c8	2c239102-080c-4345-aa90-6f25024979fc	Langkawi Cliff Villas	5	Langkawi	\N	2
80a15041-a2ec-45c4-9ae4-22f8a6af98f5	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Shinjuku Tower Hotel	4	Tokyo	\N	0
a9ebe775-8712-4688-b820-610c5814fd8a	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Kyoto Machiya Stay	4	Kyoto	\N	1
754a5f65-f291-4bcc-8239-8b41246dc587	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Hakone Onsen Ryokan	5	Hakone	\N	2
bec45db3-ed11-4f80-b5e1-9380308148af	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Interlaken Alpine Hotel	4	Interlaken	\N	0
43ac6913-2f72-42e0-bca9-b607d264b1c9	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Lucerne Lakeview	4	Lucerne	\N	1
919b733a-623b-4156-9e6a-d269b2c0197c	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Zermatt Chalet Suites	5	Zermatt	\N	2
65ff9c92-affb-416b-b5a9-a665f9b28943	b1763f26-0ed0-49a4-8490-80faafc6a155	Paris Left Bank Hotel	4	Paris	\N	0
1c301c2b-8528-408b-99fb-10e594dbe9f6	b1763f26-0ed0-49a4-8490-80faafc6a155	Amsterdam Canal House	4	Amsterdam	\N	1
ef33db4a-2901-4aa2-b1b2-660d075bb4d6	b1763f26-0ed0-49a4-8490-80faafc6a155	Rome Centro Storico	4	Rome	\N	2
8472f962-1e9c-497e-a877-14737d89588d	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Udaipur Lakeview Haveli	4	Udaipur	\N	0
36ea1af7-e704-4c78-859d-bf0208fa8402	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Jaisalmer Luxury Camp	4	Sam Dunes	\N	1
6b22ea90-beb9-4260-8020-b249c9a4fc64	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Jaipur Palace Hotel	5	Jaipur	\N	2
e3003304-2a50-4416-a622-3dd96ae4b0ce	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Munnar Hillside Resort	4	Munnar	\N	0
0cf4e53e-5392-4a0a-8d1b-d66b00c4c12a	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Alleppey Premium Houseboat	4	Alleppey	\N	1
7fd8efe0-003b-478e-bf4b-139e15d2ad5a	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Kochi Heritage Hotel	4	Fort Kochi	\N	2
93e2235f-c471-4494-b53c-1d2664c0702b	5849cc1d-988c-4310-b48d-7027c576718c	Manali Riverside Resort	4	Manali	\N	0
16a770f7-d7ce-4f49-8985-43d56c619cef	5849cc1d-988c-4310-b48d-7027c576718c	Shimla Ridge Hotel	3	Shimla	\N	1
364b88e5-6316-4a44-8aba-fba51949ff43	5849cc1d-988c-4310-b48d-7027c576718c	Kasol Pine Cottages	4	Kasol	\N	2
8ed9101c-c4c0-4e32-817e-0666cfbecf98	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Candolim Beach Resort	4	North Goa	\N	0
099861db-1848-4d26-b3d6-72700a0bfd84	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Palolem Boutique Stay	4	South Goa	\N	1
e08d8416-4938-4a5e-99f1-c178bfa6bb60	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Panjim Heritage House	3	Panjim	\N	2
eb5e1d9f-5683-4aec-9a2f-a484e192f1c8	91a3d948-35d7-48c7-a608-cbfe92137834	Kandy Lake Hotel	4	Kandy	\N	0
47b12697-9281-4bdf-9458-2b92df8e33cf	91a3d948-35d7-48c7-a608-cbfe92137834	Ella Valley Cabins	4	Ella	\N	1
82df2883-2427-462f-a895-8c12ee6618b8	91a3d948-35d7-48c7-a608-cbfe92137834	Bentota Beach Resort	4	Bentota	\N	2
1ad929c7-b0a8-4822-a7f7-d4a2ebc0913c	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Grand Baie Beach Resort	4	Grand Baie	\N	0
3e0fdac2-46a0-4c33-bcef-6d065587f5c8	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Flic en Flac Lagoon Hotel	5	Flic en Flac	\N	1
b5d9005c-4392-45c7-a7ad-865b5b23f563	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Belle Mare Luxury Villas	5	Belle Mare	\N	2
fdf7549e-c0ad-4e7c-831f-cfae43d31d87	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Paro Valley Lodge	3	Paro	\N	0
42f1707f-d5a7-4a8f-b36c-2c3e46dd39e8	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Thimphu Boutique Hotel	4	Thimphu	\N	1
e3ff1737-69ee-4765-96ee-5f9391617db5	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Punakha River Resort	4	Punakha	\N	2
1cb63ad1-0dec-43fd-a33b-6d6d879b2068	25534ce5-2b51-4471-9600-127036598b4b	Ubud Jungle Retreat	4	Ubud	Boutique jungle-view stay	0
0137f5c6-5dfb-4f8f-84ed-16cdb2171c2f	25534ce5-2b51-4471-9600-127036598b4b	Seminyak Beach Resort	5	Seminyak	Beachfront resort	0
5a5daff8-f868-4cd3-8acd-738e41ffa96c	25534ce5-2b51-4471-9600-127036598b4b	Nusa Dua Private Pool Villa	5	Nusa Dua	Private pool villa	0
\.


--
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.destinations (id, "tenantId", "countryId", name, slug, description, "heroImageKey", "isFeatured", "deletedAt", "createdAt", "updatedAt", "bestTimeToVisit", "isActive") FROM stdin;
f57f1a08-d092-407c-bc01-962f7328974f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	c6d88296-0db9-401c-a25d-08694f5ff6b2	Maldives	maldives	Overwater villas, house reefs and absolute quiet.	7c7076d8-5589-4bd2-b23d-0a75676db41b-maldives-DgCIoG22.jpg	t	\N	2026-08-19 04:19:32.24	2026-08-21 06:48:45.798	November – April	t
2824d140-2702-4a58-a0aa-6030c8134362	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	6dfc27c2-1f08-46fb-b3c9-5fc166cbcbde	Dubai	dubai	Skyline views, desert nights and effortless family days.	c4195940-10f4-42e8-9549-2f9259be9cf7-dubai-DRCuuGaX.jpg	t	\N	2026-08-19 04:19:33.224	2026-08-21 06:48:46.395	November – March	t
eae20d80-da05-4a8c-8727-1886bcc7cf52	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	Thailand	thailand	Island hopping, street food and easy value.	66107ef1-4dca-46bf-97ef-67441618a134-thailand-C2yi6qi_.jpg	t	\N	2026-08-19 04:19:34.116	2026-08-21 06:48:46.61	November – March	t
90f47cdf-17e9-4949-a4f6-3eeba777ed7f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	2b1ac0d6-fdfe-4e8c-9076-0fc317a82301	Bhutan	bhutan	Monasteries in the clouds and a permit instead of a visa.	3769ad36-282a-4670-81cb-ac600d476ab6-bhutan-BIZjWjkR.jpg	f	\N	2026-08-19 05:15:40.527	2026-08-21 06:48:49.886	March – May, September – November	t
e1dc567d-b762-40ec-9075-60e04b80cc38	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Gujarat	gujarat	Vibrant Heritage	7a1de62c-de1c-42e1-9283-61af99645546-gujarat.jpg	f	\N	2026-08-11 11:19:17.933	2026-08-12 08:39:13.412	\N	t
521f62bf-b68e-4e85-a81c-f31eaba6d672	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Munnar	munnar	Tea Valley	95caa280-6185-4630-a8c9-33e5702f9882-munnar.jpg	f	\N	2026-08-11 11:19:17.771	2026-08-12 08:39:13.508	\N	t
bb27ab5f-429d-4e57-865e-a69f2a4e7c35	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Kerala	kerala	God's Own Country	2bc3821d-3e17-464d-8764-f88401ed80b8-kerala-BRDUcEbv.jpg	f	\N	2026-08-11 11:19:17.356	2026-08-21 06:48:48.51	September – March	t
bdd09d56-d5b9-4934-81f4-66ca7c90a58c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	Phuket	phuket	Beaches and islands	015b1274-6097-43db-9759-3caf02dc5eff-phuket.jpg	f	\N	2026-08-11 06:16:14.563	2026-08-19 05:21:34.691	\N	t
f0826aab-9c60-41d2-82e2-dd2f9bff7902	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	41f88819-174f-4932-a283-11569951c20a	Singapore	singapore	Compact, spotless and made for family itineraries.	3aafe5b1-6f36-46d4-93b2-067c3855d131-singapore-D61jditK.jpg	t	\N	2026-08-19 04:19:35.631	2026-08-21 06:48:46.855	Year round	t
25534ce5-2b51-4471-9600-127036598b4b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	1c5c825e-ba41-4bf9-a15b-caa9b04f305d	Bali	bali	Rice terraces, cliff temples and warm island evenings.	5f96a70d-1cdd-4ba8-bbb5-c6b4a9e374e7-bali-C-ZvmxxP.jpg	t	\N	2026-08-19 04:19:31.246	2026-08-20 06:17:27.133	April – October	t
d487d421-1b6a-47af-aa02-a06fd7a09dfc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	1f75f43e-cbe1-41f0-8cf0-3cd080586511	Vietnam	vietnam	Ha Long cruises, old towns and remarkable value.	704066f9-2ba1-4d6e-98ff-24b70658c284-vietnam-CQl4Behy.jpg	t	\N	2026-08-19 04:19:36.572	2026-08-21 06:48:47.077	October – April	t
2c239102-080c-4345-aa90-6f25024979fc	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	f62c9849-c9ed-4836-a657-db755502a035	Malaysia	malaysia	Rainforest islands and a very easy first flight abroad.	1898b76a-7fed-44ac-b172-cccaaa06e0ec-malaysia-3pBlUwOK.jpg	t	\N	2026-08-19 04:19:37.737	2026-08-21 06:48:47.296	December – April	t
42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	4af9d23d-1fdd-46d9-94ea-e40837863259	Japan	japan	Bullet trains, blossom season and precise, beautiful days.	d1e876d1-5f1c-4a7b-b525-9027f5d8c0b0-japan-B4XzdyJ_.jpg	t	\N	2026-08-19 04:19:40.068	2026-08-21 06:48:47.583	March – May, October – November	t
7a9762e6-cd0b-4b22-ad78-4c624be6e155	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	d64f23b4-8684-41e0-b0e3-739bf0c30a7a	Switzerland	switzerland	Alpine peaks, glacier lakes and adventure sports at every turn.	238873a2-0cfa-4abe-9a82-8032dbe9a228-switzerland-D5Q0EHJx.jpg	f	\N	2026-08-19 04:19:41.105	2026-08-21 06:48:47.801	May – September, December for snow	t
b1763f26-0ed0-49a4-8490-80faafc6a155	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cf6cf88-e6d2-4047-a349-1d394af954ac	Europe	europe	Multi-city classics stitched together properly.	d1b423a7-4b7d-4442-b597-eb37205fd02b-europe.jpg	f	\N	2026-08-20 05:48:41.092	2026-08-21 06:48:48.013	April – October	t
bdc843b8-9513-4c69-aba3-1f566b02bb8b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Rajasthan	rajasthan	Land of Royals	83eccbae-ca6d-4c06-be32-86aa53b39d35-rajasthan-oD07PIG2.jpg	f	\N	2026-08-11 11:19:17.596	2026-08-21 06:48:48.242	October – March	t
5849cc1d-988c-4310-b48d-7027c576718c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Himachal Pradesh	himachal-pradesh	Mountain Bliss	f9617784-30ab-4935-9eb3-788f77c7d439-himachal-pradesh.jpg	f	\N	2026-08-11 11:19:18.14	2026-08-21 06:48:49.021	March – June, December – February for snow	t
f1ef1bdf-306d-44dd-a054-a05e55df3cf4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	9cac769d-1711-4dfb-984b-c23db1b7ddba	Goa	goa	Beach shacks, Portuguese lanes and an easy weekend reset.	1a1c50e5-1c97-4a94-b5b4-73fd8858e0d5-goa-DegD7h4J.jpg	f	\N	2026-08-19 05:15:40.025	2026-08-21 06:48:49.226	November – February	t
91a3d948-35d7-48c7-a608-cbfe92137834	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	260f1c6c-0987-4101-be33-00795c9e95ed	Sri Lanka	sri-lanka	Tea hills, ancient temples and coastlines minutes apart.	445b056f-8032-4ff0-9be1-f84c0cc6b426-srilanka-Da6P_Ceq.jpg	f	\N	2026-08-19 05:15:40.086	2026-08-21 06:48:49.433	December – April	t
cc596d4f-32a8-47d5-8eed-9d08e6fb7add	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	3a0819ff-2ceb-49b9-9605-2de701abd818	Mauritius	mauritius	Lagoon blues, resort luxury and an easy visa on arrival.	3814e6fb-8987-4e41-9319-07e8a7d5fffc-mauritius-2f6pm7cU.jpg	f	\N	2026-08-19 05:15:40.14	2026-08-21 06:48:49.663	May – December	t
\.


--
-- Data for Name: emi_plans; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.emi_plans (id, "bookingId", "totalInstallments", schedule) FROM stdin;
6bfd238f-afcd-4e88-9e49-0770bd34b28e	166c002e-e168-448d-91f9-8f96d5609783	3	[{"amount": 31666.67, "dueDate": "2026-09-01"}, {"amount": 31666.67, "dueDate": "2026-10-01"}, {"paid": false, "amount": 31666.66, "dueDate": "2026-11-01"}]
\.


--
-- Data for Name: faq_items; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.faq_items (id, "tenantId", "entityType", "entityId", question, answer, "sortOrder") FROM stdin;
8c6c9a40-4931-4205-92e2-d09ff136b71e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	\N	\N	Is visa included?	No, visa is separate.	0
c9fd50a6-c828-4d26-8693-753db192d283	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	25534ce5-2b51-4471-9600-127036598b4b	Is Bali good for a first international trip?	Yes — short flights, friendly costs and English widely spoken make it an easy first trip abroad.	0
cfe0f914-f02d-43ee-b2b2-787b66c2fbaa	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	25534ce5-2b51-4471-9600-127036598b4b	How many days is ideal?	6-8 days lets you split time between Ubud's green interior and the south coast without feeling rushed.	0
4dd6a70e-a447-4545-a6a9-4d277781dbf2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	25534ce5-2b51-4471-9600-127036598b4b	Can the itinerary be customised?	Every itinerary is a starting point — your travel expert reshapes the pace, stays and activities around what you want.	0
2f187f61-b96f-4f4a-9206-bb8cf6b0aeee	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f57f1a08-d092-407c-bc01-962f7328974f	Water villa or beach villa?	Most couples split the stay — beach villa first, water villa for the final nights.	0
90ef7549-366a-4a93-9b73-07ea2fdd758c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f57f1a08-d092-407c-bc01-962f7328974f	Are meals included?	We usually quote half board or all-inclusive so your on-island spend stays predictable.	1
c79da095-49c8-4fae-bf4e-fda5dcd8f7ab	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f57f1a08-d092-407c-bc01-962f7328974f	Is it only for honeymooners?	No. Several resorts have kids clubs and family villas — we shortlist based on who is travelling.	2
a1b0e2d2-0755-41eb-b2cb-75791fb411d9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2824d140-2702-4a58-a0aa-6030c8134362	How early should we book?	Peak season (Dec–Jan) hotels move fast — 6 to 8 weeks ahead is comfortable.	0
e275eaae-e95e-4c88-bc9b-5b6bdbb4aade	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2824d140-2702-4a58-a0aa-6030c8134362	Is Dubai family friendly?	Very. Most of our Dubai itineraries are built for families with children under 12.	1
9d4e4000-49aa-44ab-98a8-74bd7d72955b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2824d140-2702-4a58-a0aa-6030c8134362	Do you handle the visa?	Yes, visa assistance is part of the package.	2
4a27fffc-bd17-4cfd-9ef5-27cac39a99fd	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	eae20d80-da05-4a8c-8727-1886bcc7cf52	Phuket or Krabi?	Phuket for nightlife and connectivity, Krabi for quieter beaches and dramatic scenery.	0
816ae276-0447-4abc-a10a-de5c383ec8f5	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	eae20d80-da05-4a8c-8727-1886bcc7cf52	Is it good for families?	Yes — we swap late-night stops for island days and shorter transfers.	1
292075d7-fbd2-427d-bf2c-6ff6f02fca27	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	eae20d80-da05-4a8c-8727-1886bcc7cf52	What is the average budget?	Most of our Thailand trips land between ₹38K and ₹85K per person depending on hotels.	2
0677d3cb-0cb8-4af8-b421-c0757fed4e29	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Best time to visit?	Any month works; showers are short and everything major is indoors or covered.	0
3995a2f1-2093-40c5-afe4-ebe677ad9dcf	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Can we combine with Malaysia?	Yes, a Singapore + Kuala Lumpur / Langkawi combo is one of our most requested itineraries.	1
764c4da7-0625-4175-bcb6-c6b47f0863d4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Is public transport easy?	Very — we include a travel card in most packages.	2
080ee3bf-7dcb-452e-b844-221c76a8a5c9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	d487d421-1b6a-47af-aa02-a06fd7a09dfc	North or south?	First-timers usually do Hanoi + Ha Long + Da Nang; add the south only if you have 9+ days.	0
d621060c-f367-4873-bc9f-01ac7a5a4142	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Is it budget friendly?	Yes, Vietnam is one of the strongest value destinations we sell.	1
8241d59c-358c-4fff-b465-767df2f2dba9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Are internal flights needed?	Usually one short domestic hop, which we include in the quote.	2
5c7696ab-426a-4dec-8532-b78551741d12	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2c239102-080c-4345-aa90-6f25024979fc	KL or Langkawi first?	KL first, then wind down in Langkawi before flying home.	0
cd372859-b5d3-4f43-b6bd-35277a863375	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2c239102-080c-4345-aa90-6f25024979fc	Good for elderly parents?	Yes — short transfers, lifts everywhere and easy vegetarian food.	1
683505aa-0b19-4941-bd99-ceccc082e655	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	2c239102-080c-4345-aa90-6f25024979fc	How is connectivity?	Direct flights from several Indian cities keep the trip short.	2
e56699cc-7c50-46df-8acc-1054b21bae44	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	When is blossom season?	Late March to early April in most cities, but it shifts every year — we track forecasts.	0
e1f1e947-8690-45a6-a5d6-66b09f2dd79e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Is a rail pass worth it?	For multi-city routes, usually yes. We compare pass vs point-to-point in your quote.	1
1329c0ca-ba32-4730-ad90-15871218eb27	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Is Japan expensive?	Mid-range Japan is comparable to Europe; we control cost through hotel location and rail choices.	2
ea614d56-4b6e-4393-9686-a92a29d73a11	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Swiss Travel Pass or individual tickets?	For 4+ travel days the pass usually wins; we run the numbers for your route.	0
f8d40991-45a6-434d-a416-905db8bfb03d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Can we add Paris?	Yes — a Switzerland + Paris rail combination is very popular.	1
12a58b80-c435-4425-a064-b0cec2079752	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Best base towns?	Interlaken and Lucerne cover most highlights with minimal repacking.	2
6721f0e7-2676-4403-82df-f9048b17e005	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	b1763f26-0ed0-49a4-8490-80faafc6a155	How many cities in 10 days?	Three, four at most. More cities means more time in stations.	0
fa0fea90-ea85-4a03-be2a-720f3e4f2c2d	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	b1763f26-0ed0-49a4-8490-80faafc6a155	Group tour or private?	We build both; private costs more but the pace is yours.	1
51a98351-e202-479b-a459-0312f6757b2e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	b1763f26-0ed0-49a4-8490-80faafc6a155	When to apply for the visa?	Start 8–10 weeks before departure, especially in summer.	2
c17f46d3-fc4b-4680-b258-d368b7435557	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Best circuit for 7 days?	Jaipur → Jodhpur → Jaisalmer, or Udaipur → Jodhpur if you prefer a slower pace.	0
e1212cc5-ef58-46d6-b7a9-03518f9c0c60	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Is summer travel possible?	It is very hot from April to June; we'd suggest hill destinations instead.	1
908439f5-b8cf-438d-a853-faac665b2755	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Train or car?	Private car with driver gives the most flexibility across the state.	2
05f2da49-589e-4377-b914-a542a0a630b8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Monsoon travel?	June to August is lush and cheaper, but plan for rain most afternoons.	0
d9ccb409-9309-45f9-971d-bbef743fce43	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	How much driving?	Each leg is roughly 3–4 hours; we break long drives with viewpoint stops.	1
a6e2af73-ecbb-4fc2-8ec9-0aa859e076c6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Good for honeymoon?	Yes — private houseboat plus a hill resort is our most booked Kerala combination.	2
ba6e28ec-136f-43fd-9dfc-e613823b4fd9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	5849cc1d-988c-4310-b48d-7027c576718c	Where is guaranteed snow?	January–February around Solang and Sissu, subject to weather that season.	0
4dda3cd5-6da9-40bb-8148-5bbf7ab5e88e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	5849cc1d-988c-4310-b48d-7027c576718c	Volvo or flight?	Flights to Bhuntar save a full day; overnight coaches are the budget route.	1
b0c22543-3a63-4896-b6d3-c8626842c5d8	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	5849cc1d-988c-4310-b48d-7027c576718c	Suitable for kids?	Yes for Shimla–Manali; Spiti is better for older children and adults.	2
1a6ffb7d-8fd3-4c0a-be0d-4b423c315def	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	North or south Goa?	North for nightlife and cafés, south for quiet beaches and resorts.	0
e8fd5428-07e3-482d-9d87-3a9acd7ef193	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Cheapest months?	May to September, though the monsoon closes many water activities.	1
e7281c6b-6f81-4a9b-8123-2fa572a3bf40	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Is a car needed?	A scooter or a private car makes a big difference; we can arrange both.	2
d87bb5f5-e457-4303-ab55-34f3a09a3a62	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	91a3d948-35d7-48c7-a608-cbfe92137834	How many days are enough?	Seven days covers hill country, one safari park and a beach stay.	0
29bf71ce-772f-49b2-bed8-c280c576fe32	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	91a3d948-35d7-48c7-a608-cbfe92137834	Is self-drive advisable?	We recommend a car with driver; roads are narrow and slow.	1
69942cf2-dae9-4f8b-9621-14428d01220f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	91a3d948-35d7-48c7-a608-cbfe92137834	Is it family friendly?	Yes, with shorter driving days and a beach base at the end.	2
8199b290-30be-48f2-b2bf-a2b8fa1c6ea0	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	Mauritius or Maldives?	Maldives for pure resort isolation, Mauritius when you want sightseeing too.	0
3363b16b-33fc-4526-85dc-48882cc990eb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	How long is the flight?	Roughly six to seven hours from major Indian metros.	1
0a6a0007-a08f-464f-9495-b997fbf03c61	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	cc596d4f-32a8-47d5-8eed-9d08e6fb7add	All-inclusive worth it?	Often yes, since restaurants outside resorts can be spread out.	2
260c0d28-da14-4043-9b8e-a08aeb8bf67c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	How fit do I need to be?	The Tiger's Nest hike is moderate; ponies are available for part of the climb.	0
8d7de2da-8881-4a81-ac92-7dbb404c618e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	By road or air?	Fly into Paro for comfort, or drive in via Phuentsholing to save cost.	1
8d2ccd0e-b892-4f9b-b18f-2b41fc29fb06	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	destination	90f47cdf-17e9-4949-a4f6-3eeba777ed7f	Is the daily fee included?	Yes, our quotes show it as a separate, transparent line item.	2
\.


--
-- Data for Name: homepage_blocks; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.homepage_blocks (id, "tenantId", type, "configJson", "sortOrder") FROM stdin;
640e6fb6-2e6b-4b15-8e48-682113626016	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	traveler_types	{"items": [{"color": "rose", "label": "Couple", "category": "Couple"}, {"color": "emerald", "label": "Family", "category": "Family"}, {"color": "amber", "label": "Friends", "category": "Friends"}, {"color": "blue", "label": "Group", "category": "Group"}, {"color": "violet", "label": "Corporate", "category": "Corporate"}], "title": "Are you a?"}	1
a06e38f3-6ed4-4214-8a46-691504197c47	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	how_it_works	{"steps": [{"step": 1, "title": "Choose Your Destination", "description": "Browse destinations or tell our planner what you feel like."}, {"step": 2, "title": "Customize Your Trip", "description": "Swap hotels, add activities and set the pace with your expert."}, {"step": 3, "title": "Book With Expert Support", "description": "Approve the final itinerary, pay securely and get your vouchers."}, {"step": 4, "title": "Travel & Create Memories", "description": "Land with everything arranged and support a call away."}], "title": "Four steps from idea to boarding pass", "eyebrow": "How it works"}	2
8d30256b-33f2-4dc2-99b7-6b03f99e5506	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	why_choose	{"items": [{"icon": "luggage", "title": "Customized for You", "description": "100% customized tours made around you."}, {"icon": "headphones", "title": "Always by Your Side", "description": "24 X 7 customer support whenever you need us."}, {"icon": "shield-check", "title": "Trusted & Reliable", "description": "No scam, just the faith of lakhs of happy customers."}, {"icon": "handshake", "title": "Promise is Our Priority", "description": "What we promise, we deliver."}, {"icon": "hotel", "title": "Handpicked with Care", "description": "Hand selected properties and tours for the best experience."}, {"icon": "shield-plus", "title": "Worry Free Travel", "description": "Relax and enjoy, we take care of everything."}, {"icon": "user-round", "title": "Dedicated Expert Support", "description": "A dedicated expert before, during and after the trip for your feedback."}, {"icon": "settings", "title": "Our Service", "description": "Seamless, reliable and designed for your complete satisfaction."}, {"icon": "flag", "title": "Experts with You", "description": "Our experts will accompany large groups for a more comfortable journey."}], "title": "A travel company that stays on the line", "eyebrow": "Why Paxbook"}	0
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.invoices (id, "tenantId", "bookingId", "invoiceNumber", "storageKey", amount, "issuedAt") FROM stdin;
25be6018-c712-42c3-a0d4-bc1d876c3a7c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	166c002e-e168-448d-91f9-8f96d5609783	INV-202608-0001	\N	95000.00	2026-08-11 10:06:31.006
624638b8-3b53-4aa2-a5e5-8930e351d32c	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	166c002e-e168-448d-91f9-8f96d5609783	INV-202608-0002	\N	1000.00	2026-08-11 10:06:31.15
3c3d6072-c195-40ab-a99c-8b05cec6b241	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	219d94a8-f7a8-443b-8a80-eec44c7f289d	INV-202608-0003	\N	19999.00	2026-08-11 12:16:46.994
\.


--
-- Data for Name: itinerary_days; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.itinerary_days (id, "packageId", "dayNumber", title, description) FROM stdin;
efc288ca-49ef-4268-a400-102c2546efa9	4e7f5e85-4690-498d-8335-39af4921034b	1	Arrival in Bali	Airport pick-up, welcome drink and an easy evening at the resort.
1f65b902-010f-472a-bd75-39a16c54e71b	4e7f5e85-4690-498d-8335-39af4921034b	2	Ubud green day	Tegallalang terraces, a jungle swing stop and the sacred monkey forest.
043fc847-2c58-4d21-848d-16aa817e3af4	4e7f5e85-4690-498d-8335-39af4921034b	3	Nusa Penida	Speedboat crossing, Kelingking viewpoint and a snorkelling stop at Crystal Bay.
6cc4aba7-0897-471d-939c-88c7513b646e	4e7f5e85-4690-498d-8335-39af4921034b	4	Uluwatu & Seminyak	Cliff temple, Kecak dance and a beach club sunset.
709323e7-0f82-4e12-bfb0-5d321b7be581	4e7f5e85-4690-498d-8335-39af4921034b	5	Free day + spa	Balinese couple's spa and a candlelight dinner by the pool.
c4f27bd6-6f7f-4961-a549-7b3b451ba66d	4e7f5e85-4690-498d-8335-39af4921034b	6	Departure	Breakfast, checkout and an airport transfer.
16e9c4d2-8209-47fa-a49c-78792bb78d1b	518aee17-5f2f-4d00-ba85-2095083bc6a9	1	Arrive Zurich	Train to Lucerne and a lakeside evening.
5533151e-acb1-4880-b982-d9681551bf2c	518aee17-5f2f-4d00-ba85-2095083bc6a9	2	Mount Pilatus	Golden round trip by cogwheel, cable car and boat.
0c563f4e-9da7-45b1-a9c8-9315da6bb63c	518aee17-5f2f-4d00-ba85-2095083bc6a9	3	To Interlaken	Scenic rail transfer and a Harder Kulm sunset.
d11fc8d9-8ebb-4ce3-8cae-a29d07db4b16	518aee17-5f2f-4d00-ba85-2095083bc6a9	4	Jungfraujoch	Top of Europe with the ice palace and plateau.
f7e48f97-7b24-4f4b-aa03-f8221d0f9ced	518aee17-5f2f-4d00-ba85-2095083bc6a9	5	Grindelwald First	Cliff walk, first flyer and mountain carts.
bd13bacf-6d1e-464e-a349-625d2986bb0d	518aee17-5f2f-4d00-ba85-2095083bc6a9	6	Zermatt	Gornergrat railway and Matterhorn views.
f646daeb-dfa6-45ac-9fd0-7c8ba0b74254	518aee17-5f2f-4d00-ba85-2095083bc6a9	7	Free day	Optional paragliding or a Lauterbrunnen valley walk.
34ad5deb-8af3-4ddd-b99f-e6ea604dee02	518aee17-5f2f-4d00-ba85-2095083bc6a9	8	Departure	Transfer to Zurich airport.
218c88c6-1cf5-43ac-b15c-a179b30d07dd	f989fedd-4be6-4adf-83ac-c794cf3a4831	1	Arrive Kochi	Fort Kochi walk and a Kathakali performance.
dbf264a2-63e7-4ffd-b910-5b4c24837b29	f989fedd-4be6-4adf-83ac-c794cf3a4831	2	To Munnar	Waterfall stops en route and a tea estate evening.
3a2e1336-9eb6-4a74-856b-a77fe98589bc	f989fedd-4be6-4adf-83ac-c794cf3a4831	3	Munnar sightseeing	Eravikulam park, Mattupetty dam and the tea museum.
968ba50b-d9fa-4eb6-9c34-f0a49d59db8f	f989fedd-4be6-4adf-83ac-c794cf3a4831	4	Thekkady	Spice plantation tour and a Periyar lake boat ride.
96e47d29-028d-4b3f-a7d6-b0376b395f71	f989fedd-4be6-4adf-83ac-c794cf3a4831	5	Alleppey houseboat	Board a private houseboat with lunch, dinner and breakfast onboard.
a9ef5b3c-2c05-43b7-a025-db3ebc2279f5	f989fedd-4be6-4adf-83ac-c794cf3a4831	6	Departure	Disembark and transfer to Kochi airport.
63346054-a352-43cd-b1bc-ca5053fa60fc	4b1243ae-b604-4795-9954-6e50548a2be9	1	Arrival	Check-in at a beachfront resort and a Candolim sunset.
a577743a-b461-4d44-add8-5dc3ee861f83	4b1243ae-b604-4795-9954-6e50548a2be9	2	North Goa	Fort Aguada, Calangute and a water sports session.
a73b50e6-5f6d-422b-8743-fb4f95fc0f10	4b1243ae-b604-4795-9954-6e50548a2be9	3	Old Goa & cruise	Churches, Panjim lanes and a Mandovi river cruise.
bb3f33da-e2b3-47f5-b3de-2db688b09ae3	4b1243ae-b604-4795-9954-6e50548a2be9	4	Departure	Breakfast and airport transfer.
bf523f77-7c19-450b-9b73-7764667ddc0a	82e2fc31-77dc-4c33-b1ba-202048ac14c2	1	Arrive Shimla	Mall road and ridge walk in the evening.
67054eb5-fe95-462e-9387-d7d9a027f2d4	82e2fc31-77dc-4c33-b1ba-202048ac14c2	2	Kufri	Snow point excursion and horse riding.
548b304a-3c31-4f35-9d6c-0e0a50286408	82e2fc31-77dc-4c33-b1ba-202048ac14c2	3	To Manali	Scenic drive along the Beas with river stops.
ce02ad86-2443-44a7-8f22-1ac224c7539f	82e2fc31-77dc-4c33-b1ba-202048ac14c2	4	Solang valley	Ropeway, snow activities and paragliding option.
336006a4-496c-406d-89bb-55e8e320fb3a	82e2fc31-77dc-4c33-b1ba-202048ac14c2	5	Atal Tunnel & Sissu	Day trip into Lahaul with a packed lunch.
dba7e783-fe8b-438f-bb83-a89bce477dee	82e2fc31-77dc-4c33-b1ba-202048ac14c2	6	Departure	Old Manali café breakfast and drop.
3c2d8115-a2e9-4e15-a12b-5fc330bed02f	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	1	Arrive Hanoi	Old Quarter walk and a water puppet show.
c2011022-3554-4cb0-a2a7-8ae6bc2924ed	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	2	Ha Long Bay	Overnight cruise with kayaking and a cave visit.
95b6025c-0625-4f03-93db-cb6cd559785b	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	3	Back to Hanoi	Cruise brunch, return drive and a street food evening.
0ba6989b-8b31-46e5-8c7e-9176d1b2be87	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	4	Fly to Da Nang	Beach afternoon and the Dragon Bridge at night.
7760ac71-484b-4769-bc18-c78b1a097978	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	5	Ba Na Hills	Cable car, Golden Bridge and French village.
49d1327b-cd32-4081-a29d-f458884f4e4d	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	1	Arrival in Ha Long Bay	Airport pickup and check-in. Evening free to settle in.
9a850b6b-5a44-45a0-81ba-015bbc953b8f	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	2	Explore Ha Long Bay	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
ed1ce613-ae0f-4560-8256-e80fa494c892	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	3	Explore Ha Long Bay	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
67912a1f-8e40-48c5-923d-ce884518a619	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	4	Departure	Check-out and transfer to the airport.
aaf51574-494f-4ca3-8db6-18bda2d4b2f6	753e5a1a-15af-4801-9f08-8549b1cfd15b	1	Arrival in Langkawi	Airport pickup and check-in. Evening free to settle in.
2272522e-9d29-4884-9717-9fe4997df9de	753e5a1a-15af-4801-9f08-8549b1cfd15b	2	Explore Langkawi	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
fb6105f6-0ec6-483f-a69c-defbb4390039	753e5a1a-15af-4801-9f08-8549b1cfd15b	3	Explore Langkawi	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
a317c76f-9380-49ed-8833-7cf0e9345bca	753e5a1a-15af-4801-9f08-8549b1cfd15b	4	Explore Langkawi	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
67eca652-876e-4266-9d5f-57faab3a7fa8	753e5a1a-15af-4801-9f08-8549b1cfd15b	5	Departure	Check-out and transfer to the airport.
abc9925f-1784-4e94-bf43-094fd1ae484a	c0c8129c-ba80-4771-93f2-8da1edc56ee4	1	Arrival in Kyoto	Airport pickup and check-in. Evening free to settle in.
3c40c734-bb0d-456f-851b-512e0aa70c36	c0c8129c-ba80-4771-93f2-8da1edc56ee4	2	Explore Kyoto	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
e39d5802-e31b-4dea-94da-58aaa83ccced	c0c8129c-ba80-4771-93f2-8da1edc56ee4	3	Explore Kyoto	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
c2de1f04-49b0-49de-a106-8f04023fa9a5	c0c8129c-ba80-4771-93f2-8da1edc56ee4	4	Explore Kyoto	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
4a460887-dee4-41e8-ab7b-8fb7f109b708	c0c8129c-ba80-4771-93f2-8da1edc56ee4	5	Explore Kyoto	Guided sightseeing and local experiences — itinerary to be finalized by your travel expert.
eb31cb41-87a7-4999-a0b7-bcacdd3b2ca3	c0c8129c-ba80-4771-93f2-8da1edc56ee4	6	Departure	Check-out and transfer to the airport.
1491fb14-e170-4178-8eb8-ba70e8ab6d7a	5615d775-f89b-470f-8f4a-f8a38a881bd2	1	Arrival at Malé	Speedboat to the resort, welcome ceremony and a beach villa check-in.
5c95f2e6-dff8-4af4-b37f-d22316b698a1	5615d775-f89b-470f-8f4a-f8a38a881bd2	2	Reef day	House-reef snorkelling and an afternoon at the infinity pool.
b284362c-ab8f-4b39-a3d0-e4ce1b399e07	5615d775-f89b-470f-8f4a-f8a38a881bd2	3	Sandbank & dolphins	Private sandbank picnic followed by a sunset dolphin cruise.
972f5284-1020-4a68-88a2-31a6e48a6de1	5615d775-f89b-470f-8f4a-f8a38a881bd2	4	Water villa move	Shift to the overwater villa with a floating breakfast and spa session.
62a96e64-d2f0-4e89-a61d-bed961ae7c7c	5615d775-f89b-470f-8f4a-f8a38a881bd2	5	Departure	Late breakfast and speedboat back to Malé.
f72afab5-a526-42e1-8691-a5b1a811d54f	fbce3a52-8e3d-4629-a97b-d27108ee670e	1	Arrival	Meet and greet, hotel check-in and a Marina walk in the evening.
33c68a2c-4af4-4152-9ab7-85d7a802e29e	fbce3a52-8e3d-4629-a97b-d27108ee670e	2	City & Burj Khalifa	Half-day city tour with a timed sunset slot at the observation deck.
7ea06e82-2f39-49de-874c-1edd972230fa	fbce3a52-8e3d-4629-a97b-d27108ee670e	3	Desert safari	Dune bashing, camel ride and a BBQ dinner with live entertainment.
e6a75c2c-7359-4df9-b90e-441b8b468e0b	fbce3a52-8e3d-4629-a97b-d27108ee670e	4	Abu Dhabi	Sheikh Zayed Grand Mosque and a Corniche drive.
7931ca44-352d-4b06-841e-3f8cfa854b7b	fbce3a52-8e3d-4629-a97b-d27108ee670e	5	Departure	Free morning for shopping, then airport transfer.
d99dfde2-edd3-4e60-986c-b68b47934c59	1c39245e-c86f-41c1-b09e-26b201c99cc1	1	Arrive Phuket	Transfer to Patong and an evening beach walk.
4fd35644-1d05-48a3-a9ff-4d4b8a719ae5	1c39245e-c86f-41c1-b09e-26b201c99cc1	2	Phi Phi islands	Full-day speedboat tour with lunch and snorkelling.
6f1e9271-9c59-4e1f-9efa-2c636013361e	1c39245e-c86f-41c1-b09e-26b201c99cc1	3	Phang Nga bay	James Bond island and sea canoeing through the caves.
4319ffa4-c031-4c3a-abc2-8b8c2ce3ec82	1c39245e-c86f-41c1-b09e-26b201c99cc1	4	Krabi transfer	Drive to Ao Nang and a relaxed beach afternoon.
03dda02b-3db6-4e1f-b70e-f4964f5fea97	1c39245e-c86f-41c1-b09e-26b201c99cc1	5	Four islands tour	Longtail boat to Tup, Chicken and Poda islands.
3e127132-2ee9-427a-8e2b-4033f4f22956	1c39245e-c86f-41c1-b09e-26b201c99cc1	6	Bangkok	Flight to Bangkok, temple stop and a night market.
662cb54e-a384-4ff7-9fdf-1a03da412b8b	1c39245e-c86f-41c1-b09e-26b201c99cc1	7	Departure	Breakfast and transfer to the airport.
bfa5271a-dd71-4f68-b4d0-c09f5dc84f5d	cded3556-e733-41ce-982a-9cce008c17a2	1	Arrive Udaipur	City Palace and a Lake Pichola sunset boat ride.
741ae413-807e-4271-a589-19bc4eb01013	cded3556-e733-41ce-982a-9cce008c17a2	2	Udaipur to Jodhpur	Ranakpur temple stop en route.
8380c9c8-80ad-45c3-96f4-cffad97bf1d4	cded3556-e733-41ce-982a-9cce008c17a2	3	Jodhpur	Mehrangarh fort and the blue city lanes.
b0c8e7c7-1570-4292-8035-a1b46adeec0b	cded3556-e733-41ce-982a-9cce008c17a2	4	To Jaisalmer	Long drive with a desert highway stop.
254faac6-d402-4864-a945-b4c53834afe5	cded3556-e733-41ce-982a-9cce008c17a2	5	Jaisalmer	Golden fort, havelis and a Sam dunes camp night.
aad595b9-6f2c-46d0-a336-27f4c859eabd	cded3556-e733-41ce-982a-9cce008c17a2	6	To Jaipur	Travel day with an evening at Chokhi Dhani.
a6fa33c1-7f4d-4db1-9972-5c2bc5535773	cded3556-e733-41ce-982a-9cce008c17a2	7	Jaipur & departure	Amber Fort in the morning, then airport transfer.
f3d0bcbb-8c5f-4bf8-b3bc-ff3b67206ca4	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	1	Arrive Singapore	Transfer, evening at Marina Bay light show.
14553d92-35a9-4a40-b90c-8330815f6178	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	2	Sentosa	Universal Studios with a cable car ride.
0160212c-4758-46ff-afa4-c311c6f74ad1	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	3	City & Gardens	City tour, Gardens by the Bay domes and the Supertree show.
e9946e68-68a5-40f2-9843-6ef85696403a	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	4	To Kuala Lumpur	Coach transfer with a Malacca photo stop.
e8376c49-3d1f-4c13-8f4c-48d03f368022	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	5	KL city	Batu Caves, Petronas twin towers and KL Tower.
fcd003c4-0036-4160-aa33-6b8290111ff5	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	6	Genting Highlands	Cable car, theme park and a hilltop lunch.
0b3d4002-4022-4ad9-be69-0550151114d0	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	7	Departure	Free morning and airport transfer.
26de5356-5644-405c-87f6-36123fed9a7d	17ca6f62-feff-4c5a-bc36-02aba7ea9595	1	Arrive Paris	Seine evening cruise after check-in.
8f952839-4104-4bcd-bb52-dee18a481e3f	17ca6f62-feff-4c5a-bc36-02aba7ea9595	2	Paris	Eiffel summit, Louvre and Montmartre.
169584bf-56ef-49a7-ba19-8be2a573eb87	17ca6f62-feff-4c5a-bc36-02aba7ea9595	3	Disneyland or Versailles	Choose your day out of the city.
8f42929a-6175-4f54-a5b1-258da4b6f1ff	17ca6f62-feff-4c5a-bc36-02aba7ea9595	4	To Switzerland	High-speed rail to Lucerne.
c1c35365-eeb6-42e5-a05c-c3131803809d	17ca6f62-feff-4c5a-bc36-02aba7ea9595	5	Mount Pilatus	Golden round trip and lake cruise.
9513caa3-ad1e-43f0-8b1e-fad441fe95bd	17ca6f62-feff-4c5a-bc36-02aba7ea9595	6	Interlaken	Jungfraujoch excursion.
84547c55-12c5-4d46-b8bf-4b430c6588b7	17ca6f62-feff-4c5a-bc36-02aba7ea9595	7	To Venice	Rail transfer and an evening in San Marco.
4dcdf58a-aa15-4d13-8428-0234151cd190	17ca6f62-feff-4c5a-bc36-02aba7ea9595	8	Venice	Gondola ride and Murano glass workshop.
1b76c5d7-c1fb-463f-9541-0bd26ba655e7	17ca6f62-feff-4c5a-bc36-02aba7ea9595	9	To Rome	Train south, Trevi and Spanish Steps at night.
4417430b-8274-490b-bed2-4171eb40b5ea	17ca6f62-feff-4c5a-bc36-02aba7ea9595	10	Rome	Colosseum and Vatican Museums with skip-the-line entry.
7fadb43f-5864-4f84-a6c8-be5cef03160a	5a8810cd-87b6-4d87-8434-a5e84705284b	1	Arrive Kochi, drive to Munnar	\N
0b7f1b92-9107-414c-8733-3047ac1badc9	5a8810cd-87b6-4d87-8434-a5e84705284b	2	Munnar sightseeing	\N
49f544f7-6fd6-4dc2-a16a-c75764f6bf48	5a8810cd-87b6-4d87-8434-a5e84705284b	3	Drive to Alleppey, houseboat check-in	\N
591c889d-173d-4004-8f0b-348b386b01b7	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	1	Arrival day	\N
95dfa39e-3237-4609-9551-76bf718169ab	17ca6f62-feff-4c5a-bc36-02aba7ea9595	11	Departure	Transfer to Rome airport.
746a2cf5-4ceb-45a5-89df-492742aff99b	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	6	Hoi An	Ancient town, tailoring and a lantern boat ride.
37a1fcee-3fa5-40c9-b9d5-e9ee131cf803	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	7	Departure	Transfer to Da Nang airport.
\.


--
-- Data for Name: lead_follow_ups; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.lead_follow_ups (id, "leadId", "scheduledAt", "completedAt", notes, method) FROM stdin;
7d4b2bb7-8fec-479b-86f5-9910e33e337e	cfbff2cc-0b6d-4c75-b502-f5c66417e017	2026-08-20 10:00:00	\N	\N	Email
ad1d3e06-cfde-44de-808d-c03180477c3e	cfbff2cc-0b6d-4c75-b502-f5c66417e017	2026-08-15 10:00:00	2026-08-11 10:00:00	Introduce packages	Call
1f29a9d4-2b57-48fe-bf21-5c7d044adb29	6e76e2de-0d0d-4bec-bdca-ec8ff9877603	2026-08-11 11:10:50.235	\N	Looking for a 5-night honeymoon package in December, budget around 1.2L for two.	Website Inquiry
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.leads (id, "tenantId", "customerId", name, email, phone, source, status, "assignedConsultantId", "destinationInterest", "createdAt") FROM stdin;
cfbff2cc-0b6d-4c75-b502-f5c66417e017	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	\N	Priya Mehta	priya@example.com	9998887771	Website	CONVERTED	20b6c891-02d1-43ab-9ee4-65372be811b2	Bali	2026-08-11 09:52:23.646
6e76e2de-0d0d-4bec-bdca-ec8ff9877603	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	\N	Rahul Kapoor	rahul.kapoor@example.com	9123456780	Website	NEW	\N	Phuket	2026-08-11 11:10:50.164
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.notifications (id, "tenantId", "customerId", type, title, body, "isRead", "createdAt") FROM stdin;
1b520ef7-0595-4188-9178-f5ef4f941931	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	df5b2d4b-88ee-4ed8-a78a-101e995204ad	PAYMENT	Payment received	We've received your payment of 19999 INR.	f	2026-08-11 12:16:46.929
55c79b0a-33ea-4676-ad63-22a8b03b4ee9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	df5b2d4b-88ee-4ed8-a78a-101e995204ad	BOOKING_STATUS	Booking confirmed	Your booking is fully paid and confirmed. Your invoice and travel voucher are now available.	f	2026-08-11 12:16:47
89862b17-d335-4c63-86b1-9be65137efb2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	df5b2d4b-88ee-4ed8-a78a-101e995204ad	CANCELLATION	Cancellation approved	Your cancellation request has been approved and the booking has been cancelled.	f	2026-08-11 12:18:12.215
\.


--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.otp_codes (id, "subjectType", "subjectId", channel, "codeHash", "expiresAt", "consumedAt", "createdAt") FROM stdin;
baeb6f8d-9504-4546-b322-a26941fa1c42	CUSTOMER	9876500001	SMS	$argon2id$v=19$m=65536,t=3,p=4$Yxi3KA/dhU5FzP/EVLEr8g$wGaxYPgY4lEQV3v8PznDu3wMEFLd+zgXSfCQnkQtiZM	2026-08-11 12:21:26.389	2026-08-11 12:16:27.067	2026-08-11 12:16:26.395
d24123e3-dab2-4048-99a6-a6214cd344f7	CUSTOMER	9876500002	SMS	$argon2id$v=19$m=65536,t=3,p=4$/v6wYf5hG5Y9ugQ/FpbcVQ$2HM8dx6i43Gj9zyxo876nTc3yqBz2KUmMD3+yPbCWXI	2026-08-11 12:24:37.957	2026-08-11 12:19:38.623	2026-08-11 12:19:37.959
a736ad59-1ba6-4c78-b3a6-8b271abe46d1	CUSTOMER	9876500050	SMS	$argon2id$v=19$m=65536,t=3,p=4$0INkX+363tmIpoipfC7VOA$rkkL8HtHCvjuUg+an15i8gdDlZOVMbTWaa26kn+AKkI	2026-08-11 12:26:16.705	\N	2026-08-11 12:21:16.706
9d1ab6f5-7bb6-42de-9b88-0d0c298669f0	CUSTOMER	9876500051	SMS	$argon2id$v=19$m=65536,t=3,p=4$qzFKJkP9mfy6R9y9Cn+6gQ$SwCAj60ztcKG3eF9aKxW4+T6Vr+Ph/uqI+qu2oJ33Lg	2026-08-11 12:26:33.371	2026-08-11 12:21:34.044	2026-08-11 12:21:33.372
62978dff-de0b-458b-8fab-9f4c4c5033ea	CUSTOMER	9876511111	SMS	$argon2id$v=19$m=65536,t=3,p=4$N4FCEWkiUtWMwRTyX15nyA$L51bJD5xw7Wb9zNpdoEbVzNhV2zkHfy4oEADH7U1wGw	2026-08-12 06:31:48.247	2026-08-12 06:26:48.955	2026-08-12 06:26:48.249
95ef9574-96e5-4030-8f5a-68c25810ffec	CUSTOMER	9876522222	SMS	$argon2id$v=19$m=65536,t=3,p=4$fdCrnQdrqNqiHMSxjeNtCQ$hRApeR/ziGYyJpcaP0srFoEQNmdJgs5VfIUyK3412ms	2026-08-12 07:56:35.899	2026-08-12 07:51:36.548	2026-08-12 07:51:35.901
47022df8-deb5-4a6a-9ddf-856578d478c7	CUSTOMER	+919999999999	SMS	$argon2id$v=19$m=65536,t=3,p=4$hr0nYfMlVeFVZQMdmJxiUw$rSc3SCaQyssF12iGWovPqsc1Zg60KKvUAmD1R6Ixz4E	2026-08-14 08:31:49.344	\N	2026-08-14 08:26:49.346
6e8a20f4-0517-49b9-a03a-2930d11db6ab	CUSTOMER	+919888877776	SMS	$argon2id$v=19$m=65536,t=3,p=4$HwnMq5nhLCz15WkBtQKqiw$6Cnt4/ZPcggZsZpBYsuIE39A9PP4008Ga2mgE5nUkwc	2026-08-14 08:49:13.554	\N	2026-08-14 08:44:13.555
\.


--
-- Data for Name: package_activities; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_activities (id, "itineraryDayId", "activityVendorId", name, description, "isOptional") FROM stdin;
ed87a751-f7ab-4dad-97dd-1eb4d48b3228	7fadb43f-5864-4f84-a6c8-be5cef03160a	\N	Tea garden visit	\N	f
a4dfc2b4-803a-492d-ba8c-da57021df2e9	0b7f1b92-9107-414c-8733-3047ac1badc9	\N	Eravikulam National Park	\N	t
90026b4c-9918-4b4f-bd08-7cef55100e60	49f544f7-6fd6-4dc2-a16a-c75764f6bf48	\N	Backwater cruise	\N	f
f95a2e63-d91c-4418-9b5d-d5dd269625b9	591c889d-173d-4004-8f0b-348b386b01b7	\N	Snorkeling trip	\N	f
\.


--
-- Data for Name: package_flights; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_flights (id, "packageId", sector, "carrierName", "isIncluded") FROM stdin;
\.


--
-- Data for Name: package_gallery_images; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_gallery_images (id, "packageId", "storageKey", "sortOrder") FROM stdin;
b1a7253e-ff44-4c96-b88b-635bbe930bef	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	bbb601b9-5de1-46ad-82e0-761a2074c177-ha-long-bay-gallery.jpg	0
128ad855-95af-4238-a78a-7990ec98eb9f	753e5a1a-15af-4801-9f08-8549b1cfd15b	3aa225f2-9fc8-417c-8a26-3a2e75d40522-langkawi-gallery.jpg	0
0cc83ed7-e1d1-4e24-96a4-e6017636630a	c0c8129c-ba80-4771-93f2-8da1edc56ee4	3ff6ad5e-3a52-4981-b3da-0f7b0c6e8913-kyoto-gallery.jpg	0
2970a622-9954-4745-ae4d-7c61d5f9edb9	5a8810cd-87b6-4d87-8434-a5e84705284b	80c8b0de-9909-48f4-8b8c-a8f96a090776-kerala-backwaters-munnar-family-escape.jpg	0
227215d3-12ec-4752-ab65-60bb38a50346	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	acdc3db8-3aed-459e-892c-1efce34a72d9-phuket-honeymoon-escape.jpg	0
2f60b049-4619-4a0c-ae8e-17471fe681c0	4e7f5e85-4690-498d-8335-39af4921034b	9f33283f-b3d3-47dc-8b4c-1992e768476d-bali-C-ZvmxxP.jpg	0
6fabb055-ddac-4172-82e1-b701156855f2	5615d775-f89b-470f-8f4a-f8a38a881bd2	26209972-e947-4a22-b170-56fda5b1a9b8-maldives-DgCIoG22.jpg	0
c1981e74-ca63-438b-8c8c-8438a2231236	fbce3a52-8e3d-4629-a97b-d27108ee670e	734068ad-a5cb-463b-a597-19165acfae94-dubai-DRCuuGaX.jpg	0
c59d6e17-9334-48fd-8609-c9563278ba90	1c39245e-c86f-41c1-b09e-26b201c99cc1	92aeaf03-e553-4cdf-811b-ba6941d510ce-thailand-C2yi6qi_.jpg	0
648ef034-b9d0-4cda-8c4f-c6f99867e585	518aee17-5f2f-4d00-ba85-2095083bc6a9	5872958f-c810-47d6-947f-533d6335f919-switzerland-D5Q0EHJx.jpg	0
23a18f56-d7b6-40cd-bfeb-e3847976ede3	f989fedd-4be6-4adf-83ac-c794cf3a4831	6ecdfd05-8c45-426d-9dcb-a86da8458fb1-kerala-BRDUcEbv.jpg	0
9b5114bb-8609-4437-8cfa-c2e55e68b281	cded3556-e733-41ce-982a-9cce008c17a2	a7b18a12-4bdb-4263-9453-c7afa7958b64-rajasthan-oD07PIG2.jpg	0
ea1653ed-dd70-40f2-b6c9-45c512a01b73	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	44b0b38f-e12c-4bda-8b52-11f2b76c0a8b-singapore-D61jditK.jpg	0
01993ed3-a7ef-47d3-b168-84d958267398	4b1243ae-b604-4795-9954-6e50548a2be9	70af56e4-0ce1-4ddc-9d43-f14685c273d8-goa-DegD7h4J.jpg	0
04143bd0-0ab8-480d-97b2-72a7631b41f4	82e2fc31-77dc-4c33-b1ba-202048ac14c2	484fc1c1-5298-4b9c-aa97-0c7a7561a92b-shimla-manali-adventure-trail.jpg	0
6cbf9c13-11a4-4d39-ae57-64727a71e78a	17ca6f62-feff-4c5a-bc36-02aba7ea9595	909fcf41-f28f-4f35-a1e5-4f91b8655737-europe-gallery.jpg	0
\.


--
-- Data for Name: package_hotels; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_hotels (id, "packageId", "cityName", "hotelVendorId", "roomType", "mealPlan", "checkInDay", "checkOutDay") FROM stdin;
c388f8c8-f61b-4d6d-a1fc-262f191f7140	5a8810cd-87b6-4d87-8434-a5e84705284b	Munnar	\N	Deluxe	Breakfast	1	3
aa3e244e-d5a5-4dc9-846a-505ec3e7c7a6	5a8810cd-87b6-4d87-8434-a5e84705284b	Alleppey	\N	Houseboat	All meals	3	4
9006e2cc-51fb-4ba8-8c0d-1467aac2c189	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	Phuket	\N	\N	\N	1	5
b0809290-367d-42af-9d17-556ae95827c5	82e2fc31-77dc-4c33-b1ba-202048ac14c2	Shimla	\N	Standard	Breakfast	1	3
8d3488e8-1ff1-4641-9e6b-b2c8f72c5f24	82e2fc31-77dc-4c33-b1ba-202048ac14c2	Manali	\N	Standard	Breakfast	3	6
\.


--
-- Data for Name: package_pricing_tiers; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_pricing_tiers (id, "packageId", name, "basePrice", currency) FROM stdin;
9fb15c18-667e-4352-a212-ba94b9bb0759	49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	Standard	45000.00	INR
dc57ce49-bdf8-4f03-87b7-6a8f9034fe82	753e5a1a-15af-4801-9f08-8549b1cfd15b	Standard	52000.00	INR
ce930855-ef42-484c-9350-84ba70b14fc8	c0c8129c-ba80-4771-93f2-8da1edc56ee4	Standard	110000.00	INR
b58d06a5-fae9-4663-8973-f3e44a34ce73	5a8810cd-87b6-4d87-8434-a5e84705284b	Standard	28500.00	INR
35151cb2-a294-4c48-8b47-bc6049c28be8	4e7f5e85-4690-498d-8335-39af4921034b	Standard	58900.00	INR
db9e81b4-2631-4895-871c-655391d3313c	5615d775-f89b-470f-8f4a-f8a38a881bd2	Standard	118900.00	INR
e2d798c0-6105-429a-9ff6-b4bd9a3aaea1	fbce3a52-8e3d-4629-a97b-d27108ee670e	Standard	61900.00	INR
29c15dee-4611-4538-b8d7-da96eee0dce2	1c39245e-c86f-41c1-b09e-26b201c99cc1	Standard	44900.00	INR
8448ecd2-b43d-42a7-880a-42d6a6adc95e	518aee17-5f2f-4d00-ba85-2095083bc6a9	Standard	189900.00	INR
21fc3aec-4f0e-48a0-8ccc-d66d8e4cd640	f989fedd-4be6-4adf-83ac-c794cf3a4831	Standard	26900.00	INR
b0169c74-e6cb-4f01-9234-f1e30218b147	cded3556-e733-41ce-982a-9cce008c17a2	Standard	32900.00	INR
b9c13bda-8bca-4444-aafc-7ea38ce95cd0	9fb09db3-7da0-4e3d-aecd-42b2201c2d60	Standard	78900.00	INR
6d1af41f-6886-4cf3-a847-6ac706ab6b1b	4b1243ae-b604-4795-9954-6e50548a2be9	Standard	16900.00	INR
44065ccb-fe68-47a0-a83a-d1458d4ca916	82e2fc31-77dc-4c33-b1ba-202048ac14c2	Standard	22900.00	INR
06c06caf-e869-407b-a726-019ec1ae23f2	17ca6f62-feff-4c5a-bc36-02aba7ea9595	Standard	234900.00	INR
928390af-0d7e-42e4-805b-2e9c6ad9110f	e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	Standard	49900.00	INR
\.


--
-- Data for Name: package_route_map_points; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.package_route_map_points (id, "packageId", lat, lng, "sortOrder", label) FROM stdin;
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.packages (id, "tenantId", "destinationId", title, slug, "durationDays", "durationNights", "basePrice", status, "templateHintSlug", "deletedAt", "publishedAt", "createdAt", "updatedAt", inclusions) FROM stdin;
753e5a1a-15af-4801-9f08-8549b1cfd15b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	2c239102-080c-4345-aa90-6f25024979fc	Langkawi Island Getaway	langkawi-island-getaway	5	4	52000.00	DRAFT	\N	2026-08-20 05:49:50.721	\N	2026-08-19 04:19:38.262	2026-08-20 05:49:50.722	{}
49055e11-e5cb-49e7-b0dd-b2a82e2c88b2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Ha Long Bay Cruise Adventure	ha-long-bay-cruise-adventure	4	3	45000.00	DRAFT	\N	2026-08-20 05:49:50.734	\N	2026-08-19 04:19:37.15	2026-08-20 05:49:50.735	{}
e049c76d-d5e3-4ad3-b1d5-1ddeba9b8485	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	d487d421-1b6a-47af-aa02-a06fd7a09dfc	Vietnam Discovery	vietnam-discovery	7	6	49900.00	PUBLISHED	\N	\N	2026-08-21 06:53:38.118	2026-08-21 06:53:38.12	2026-08-21 06:53:38.12	{Flights,Hotels,Transfers}
518aee17-5f2f-4d00-ba85-2095083bc6a9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	7a9762e6-cd0b-4b22-ad78-4c624be6e155	Switzerland Alpine Classic	interlaken-alpine-adventure	8	7	189900.00	PUBLISHED	\N	\N	2026-08-19 05:15:41.05	2026-08-19 04:19:41.644	2026-08-21 06:53:36.834	{Hotels,Activities}
f989fedd-4be6-4adf-83ac-c794cf3a4831	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Kerala Backwater Serenity	kerala-backwater-serenity	6	5	26900.00	PUBLISHED	\N	\N	2026-08-19 05:15:41.117	2026-08-19 05:15:41.119	2026-08-21 06:53:37.049	{Hotels,Transfers,Activities}
cded3556-e733-41ce-982a-9cce008c17a2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	bdc843b8-9513-4c69-aba3-1f566b02bb8b	Rajasthan Royal Trail	rajasthan-royal-trail	7	6	32900.00	PUBLISHED	\N	\N	2026-08-19 05:15:41.181	2026-08-19 05:15:41.183	2026-08-21 06:53:37.198	{Hotels,Transfers,Activities}
9fb09db3-7da0-4e3d-aecd-42b2201c2d60	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	f0826aab-9c60-41d2-82e2-dd2f9bff7902	Singapore + Malaysia Combo	singapore-family-discovery	7	6	78900.00	PUBLISHED	\N	\N	2026-08-19 05:15:40.987	2026-08-19 04:19:36.114	2026-08-21 06:53:37.529	{Hotels,Transfers,Activities}
5a8810cd-87b6-4d87-8434-a5e84705284b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	bb27ab5f-429d-4e57-865e-a69f2a4e7c35	Kerala Backwaters & Munnar Family Escape	kerala-backwaters-munnar-family-escape	5	4	28500.00	PUBLISHED	\N	\N	2026-08-11 11:19:47.552	2026-08-11 11:19:47.554	2026-08-20 06:25:59.583	{Flights,Hotels,Transfers,Activities}
60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	bdd09d56-d5b9-4934-81f4-66ca7c90a58c	Phuket Honeymoon Escape (Updated)	phuket-honeymoon-escape	5	4	52000.00	PUBLISHED	\N	\N	2026-08-11 06:23:11.51	2026-08-11 06:16:55.797	2026-08-20 06:25:59.648	{Flights,Hotels,Transfers,Activities}
4e7f5e85-4690-498d-8335-39af4921034b	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	25534ce5-2b51-4471-9600-127036598b4b	Bali Honeymoon Escape	bali-honeymoon-escape	6	5	58900.00	PUBLISHED	\N	\N	2026-08-19 05:15:40.714	2026-08-19 04:19:31.709	2026-08-21 06:53:35.359	{Hotels,Transfers,Activities}
5615d775-f89b-470f-8f4a-f8a38a881bd2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	f57f1a08-d092-407c-bc01-962f7328974f	Maldives Water Villa Retreat	maldives-overwater-villa-retreat	5	4	118900.00	PUBLISHED	\N	\N	2026-08-19 05:15:40.807	2026-08-19 04:19:32.822	2026-08-21 06:53:35.92	{Hotels,Transfers,Activities}
c0c8129c-ba80-4771-93f2-8da1edc56ee4	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	42cb4b1b-b9e0-4b0d-bba5-c29e37c92d48	Kyoto Cultural Immersion	kyoto-cultural-immersion	6	5	110000.00	DRAFT	\N	2026-08-20 05:49:50.706	\N	2026-08-19 04:19:40.634	2026-08-20 05:49:50.707	{}
4b1243ae-b604-4795-9954-6e50548a2be9	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	f1ef1bdf-306d-44dd-a054-a05e55df3cf4	Goa Long Weekend	goa-long-weekend	4	3	16900.00	PUBLISHED	\N	\N	2026-08-19 05:15:41.259	2026-08-19 05:15:41.262	2026-08-21 06:53:37.733	{Hotels,Transfers,Activities}
82e2fc31-77dc-4c33-b1ba-202048ac14c2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	5849cc1d-988c-4310-b48d-7027c576718c	Himachal Snow Adventure	shimla-manali-adventure-trail	6	5	22900.00	PUBLISHED	\N	\N	2026-08-11 11:19:47.848	2026-08-11 11:19:47.85	2026-08-21 06:53:37.834	{Hotels,Transfers,Activities}
17ca6f62-feff-4c5a-bc36-02aba7ea9595	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	b1763f26-0ed0-49a4-8490-80faafc6a155	Europe Highlights: Paris, Swiss & Rome	europe-highlights-paris-swiss-rome	11	10	234900.00	PUBLISHED	\N	\N	2026-08-20 05:48:41.189	2026-08-20 05:48:41.193	2026-08-21 06:53:38.05	{Hotels,Transfers,Activities}
fbce3a52-8e3d-4629-a97b-d27108ee670e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	2824d140-2702-4a58-a0aa-6030c8134362	Dubai Family Holiday	dubai-city-desert-explorer	5	4	61900.00	PUBLISHED	\N	\N	2026-08-19 05:15:40.874	2026-08-19 04:19:33.668	2026-08-21 06:53:36.215	{Hotels,Transfers,Activities}
1c39245e-c86f-41c1-b09e-26b201c99cc1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	eae20d80-da05-4a8c-8727-1886bcc7cf52	Thailand Island Hopper	bangkok-street-food-temples-trail	7	6	44900.00	PUBLISHED	\N	\N	2026-08-19 05:15:40.936	2026-08-19 04:19:34.671	2026-08-21 06:53:36.709	{Flights,Hotels,Transfers,Activities}
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.pages (id, "tenantId", slug, title, body, status, "createdAt", "updatedAt") FROM stdin;
82a116a3-6d68-4a2a-bc5c-5b7c0f56a296	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	about-us	About Us	Paxbook is a travel booking platform.	PUBLISHED	2026-08-11 07:34:00.081	2026-08-11 07:34:00.081
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.payments (id, "tenantId", "bookingId", provider, "providerRef", amount, status, method, "capturedAt", "createdAt") FROM stdin;
0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	166c002e-e168-448d-91f9-8f96d5609783	razorpay	pay_test_001	50000.00	CAPTURED	UPI	2026-08-11 10:06:14.17	2026-08-11 10:06:13.728
381bdd09-997e-46c6-b47d-ed94c80bf3c2	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	166c002e-e168-448d-91f9-8f96d5609783	razorpay	\N	45000.00	CAPTURED	Card	2026-08-11 10:06:15.12	2026-08-11 10:06:14.703
52f2b0da-1bc2-4517-bd24-e937e82d27ac	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	219d94a8-f7a8-443b-8a80-eec44c7f289d	razorpay	mock_order_58e96cf4-3f80-4ed1-ada6-71ee20253273	19999.00	CAPTURED	\N	2026-08-11 12:16:46.905	2026-08-11 12:16:46.341
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.permissions (id, key, description) FROM stdin;
827b913e-ce19-4f2b-b7c0-bfccfc4d3eaa	cms.read	\N
641da365-9031-400b-91f4-c6d2d22a9a58	cms.write	\N
4d8a20fb-36dd-4811-a3c0-5fac08c0de0f	destinations.read	\N
cf9080d9-61fd-4262-8bb8-026aee0c36ae	destinations.write	\N
4dddcd8c-8412-44e4-ba07-6cdfb02de667	packages.read	\N
7e11b453-42ca-452d-a516-605deac41829	packages.write	\N
f0ef3f97-6e5b-476b-b00a-248a179b66af	customers.read	\N
34e84749-d689-473e-9740-bf56d9355e9d	customers.write	\N
dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f	crm.read	\N
5716028a-3fbc-40fc-909e-471c8c075942	crm.write	\N
4ca5ea7a-919f-4b03-89c0-973bc279f9ee	bookings.read	\N
6c2c214f-a74c-47b6-af91-2dcd2fa77594	bookings.write	\N
17fdd07b-3e7f-419a-a7eb-5108ca06f599	vendors.read	\N
03b2821e-b81f-47bd-9e16-beeb3a3302b2	vendors.write	\N
fa6a2ad3-806e-4ce6-a1ec-8a5d4023e2c7	finance.read	\N
8a16b3b2-2711-46f5-b4b9-cb5473bb8503	finance.write	\N
fb6e996f-fd73-45a7-9baf-4836740e72a6	reports.read	\N
8acafd16-6d67-4507-b583-d2ef49000d92	settings.read	\N
36c4f883-af5d-4737-9b0b-96fa03954dad	settings.write	\N
46dbfb4e-02ab-4b51-bde6-4b7dbfb88cb9	users.read	\N
76153110-b5c7-4ada-b8ab-0d16f49ea4eb	users.write	\N
f1d81748-7a58-402e-950c-530ed7b4c3e3	roles.write	\N
fee2aa5a-de0a-47a0-9ca8-1113dc294fbd	audit_log.read	\N
0fdb555b-fc89-42f0-82a7-c6b65839dce1	reviews.read	\N
c2bd7cf6-b3aa-433a-8e13-460e959d4a25	reviews.write	\N
f8174f61-ca4d-4ff9-aba6-7bf2b6f21875	offers.read	\N
fcb71388-6aca-40bb-bf4b-3ed241e43646	offers.write	\N
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.plans (id, name, "priceMonthly", currency, "maxAdminUsers", "maxPackages", "isActive", "createdAt", "razorpayPlanId") FROM stdin;
17539795-6c27-4ab3-a257-a04903802675	Starter	2999.00	INR	3	25	t	2026-08-12 05:44:52.199	\N
20e94cbe-e5aa-4c2e-8142-0404052941d9	Growth	9999.00	INR	10	150	t	2026-08-12 05:44:52.211	\N
33af6b24-5da7-41be-a137-3f4cd4fa3998	Enterprise	24999.00	INR	\N	\N	t	2026-08-12 05:44:52.216	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.refresh_tokens (id, "adminUserId", "tokenHash", "expiresAt", "revokedAt", "replacedBy", "createdAt") FROM stdin;
808da3d3-38ff-4782-bdb3-96b14d5bbaf8	20b6c891-02d1-43ab-9ee4-65372be811b2	100fcbe2a00bb3a954f1d723ab0aeb6698cbe695b117c0cea49d8a74c10203a2	2026-09-07 09:13:22.204	\N	\N	2026-08-08 09:13:22.207
52459ba0-feb5-4698-8f49-a24e20c3b222	dce14043-f6ae-4c09-9154-2c79b3025d30	1e7ad5cb1857cd9559533812bd573fb8dcb8162c3ca93e3980b3e0ca8c783bb6	2026-09-07 09:13:22.715	\N	\N	2026-08-08 09:13:22.716
02604f8d-1d08-4a81-bef8-4fbeb863e55a	20b6c891-02d1-43ab-9ee4-65372be811b2	e0b1405990e00944c2a3d2b1ccc85ea37f8e27be98ddbef34d7d412da3a74584	2026-09-07 09:15:20.047	\N	\N	2026-08-08 09:15:20.049
70067d73-1699-44e4-b8dc-49cff794d714	20b6c891-02d1-43ab-9ee4-65372be811b2	4f407123dacc98ea1a6775dd59b4bae8ffc9f6b040f4bbb648259eb06c3041ca	2026-09-07 09:27:29.492	\N	\N	2026-08-08 09:27:29.493
ee321383-1a99-46da-b8b3-1acd0274dc79	20b6c891-02d1-43ab-9ee4-65372be811b2	0ea5af8f5464a40bbbe0f784587acd8b1071ac74932d2d74fe033844ad99e741	2026-09-10 06:15:35.194	\N	\N	2026-08-11 06:15:35.195
adaef8a0-e0f8-487f-ba1b-e1a4618df406	20b6c891-02d1-43ab-9ee4-65372be811b2	a9dd576e141e30dbb1ac7bae0f94f2362cbfc52638decbe9944dd1167779133a	2026-09-10 06:16:13.938	\N	\N	2026-08-11 06:16:13.939
6dac811a-843a-47d6-9038-4b16a4d04d12	dce14043-f6ae-4c09-9154-2c79b3025d30	3a3e499387613b74b7f6a1799911809d7346e29cbc174e8811144cd8ed125020	2026-09-10 06:23:33.603	\N	\N	2026-08-11 06:23:33.605
3a782b12-67c7-4aec-8169-ac3dbe1a59ee	20b6c891-02d1-43ab-9ee4-65372be811b2	4a1b564b521647c0df450819a1ecbbec9b3e531b09bde5bf97effada80eb7572	2026-09-10 07:33:10.026	\N	\N	2026-08-11 07:33:10.028
ec529ed9-33fa-435a-b0b1-8710cc9d4c01	20b6c891-02d1-43ab-9ee4-65372be811b2	f8f983375afe22bef6489729c6128452e4b29f26b286c8160494d70504061420	2026-09-10 07:33:47.623	\N	\N	2026-08-11 07:33:47.624
3309db3e-94e9-46b1-8c7e-c946ca3faa64	dce14043-f6ae-4c09-9154-2c79b3025d30	12c156970cafe48de5168c13b0e09ea2bcfdba1f074461ba9e0b280f04170296	2026-09-10 07:34:22.988	\N	\N	2026-08-11 07:34:22.989
690b07d2-2b4d-4c7d-b871-6607ddd2e8dd	20b6c891-02d1-43ab-9ee4-65372be811b2	51ff3ea09820dee8770a5ecd7546fc10c86f194749eb5e12ffd4216da675ce9f	2026-09-10 09:34:52.842	\N	\N	2026-08-11 09:34:52.854
1c5575a7-9291-4c95-bd98-f2450d02ff07	dce14043-f6ae-4c09-9154-2c79b3025d30	2d149831cdf5198c80b045774350e297580a2c8b7908833e2965d259747964a8	2026-09-10 09:36:36.976	\N	\N	2026-08-11 09:36:36.977
a46997c2-3a70-44e2-b34a-93903b8937c0	20b6c891-02d1-43ab-9ee4-65372be811b2	f0d89c0c3112669e5f93414768b428cab5eb0921128c6c70eb3b8f843464d27f	2026-09-10 09:52:22.916	\N	\N	2026-08-11 09:52:22.919
d3923ea0-44e9-4141-9b26-495c6d2dbc3f	dce14043-f6ae-4c09-9154-2c79b3025d30	e00ee7de5cd7ce0e71abee51eacc2524ee4be3aae30d04c172f909a0621ac3c9	2026-09-10 09:52:55.017	\N	\N	2026-08-11 09:52:55.019
51d18799-a8ed-4741-baac-5b1695aa4911	20b6c891-02d1-43ab-9ee4-65372be811b2	c8f90882640198c64d845cd83695fba9c64d1a4aadbcaebd8db1351ed7fcf8dc	2026-09-10 10:06:13.474	\N	\N	2026-08-11 10:06:13.48
48ad46b4-c3c2-4a6f-9d6e-eedab22d4941	dce14043-f6ae-4c09-9154-2c79b3025d30	30fac62e788620d95a825171d9fba94f0747d41efa964eb02cd4aaa2845b74ae	2026-09-10 10:07:19.558	\N	\N	2026-08-11 10:07:19.56
f48a305f-0b76-49e8-89d5-16fb75a42f1d	20b6c891-02d1-43ab-9ee4-65372be811b2	6e72f4cd4e228e715500ea31f1a7ea093510bfb5318d444efa3274e5acc0268f	2026-09-10 10:17:14.856	\N	\N	2026-08-11 10:17:14.859
a9c02941-3f6f-443c-bb6f-2a6d9f670c45	dce14043-f6ae-4c09-9154-2c79b3025d30	a3bf631c11ffe7119ddd0c3774c39c8c5d1fb63f4d028410073764b3dd57add0	2026-09-10 10:18:08.928	\N	\N	2026-08-11 10:18:08.929
15a96469-0931-494e-b8ba-7e4efeb48ad6	20b6c891-02d1-43ab-9ee4-65372be811b2	88bf29dc66017ad3214cc134e7bbd3e80a2924e51e21ebd3a573e93c453d1fff	2026-09-10 10:29:49.714	\N	\N	2026-08-11 10:29:49.72
c819d9e0-63f0-4368-b340-c553d723060f	dce14043-f6ae-4c09-9154-2c79b3025d30	81da515f759a36745ed5cccaf52e142103e9981c72ade9ccef7c6f9acdf2630b	2026-09-10 10:31:04.377	\N	\N	2026-08-11 10:31:04.378
35fceb24-da6e-462c-ab55-3b69e94dd0c4	20b6c891-02d1-43ab-9ee4-65372be811b2	52de5a9702a07456b47e334f7b2e1e506e949146f83d5f27890cd607f4a5574e	2026-09-10 11:10:50.62	\N	\N	2026-08-11 11:10:50.632
e6562706-9976-4a41-af20-ab9005d91c62	20b6c891-02d1-43ab-9ee4-65372be811b2	4f30c10e8c17cf98f941417a3b8c9cd3841059b6f29858a7ba69e1fa5419ab55	2026-09-10 11:11:04.605	\N	\N	2026-08-11 11:11:04.617
9d9037f0-b984-4e1e-902d-0a0002063073	20b6c891-02d1-43ab-9ee4-65372be811b2	3037d3124539a7f4b7ed581e29a31fbab5178a838e99fd189ec908f3d05005e0	2026-09-10 11:19:15.432	\N	\N	2026-08-11 11:19:15.433
8b0eb811-a534-4198-ab2e-c4e1df3b6ab2	20b6c891-02d1-43ab-9ee4-65372be811b2	e9b2a6d8e4c6cccef87397c854a04366c7f306b12bb4895b385a4cd1413ea708	2026-09-10 11:19:47.288	\N	\N	2026-08-11 11:19:47.289
7d87a9a4-eb6f-4528-9c38-132d27903d94	20b6c891-02d1-43ab-9ee4-65372be811b2	d2c4d395d480091129507c949a51bd0480e91f2e9e3831eb336070d887557f9f	2026-09-10 12:18:11.603	\N	\N	2026-08-11 12:18:11.607
f83e14b6-c557-449c-ba92-e3de6751115f	dce14043-f6ae-4c09-9154-2c79b3025d30	ca990ee66012663d07a5f8d2fb67867c28d0539c46ade2f64b91b120896f1d3d	2026-09-10 12:19:39.781	\N	\N	2026-08-11 12:19:39.783
48a0cc29-ebb1-4a23-a4ec-79e6cff866d3	20b6c891-02d1-43ab-9ee4-65372be811b2	732fb285216da66b66e2424ed2353de0025f711a3bd969221dc0e187b432e97f	2026-09-10 12:51:27.772	\N	\N	2026-08-11 12:51:27.786
def944f6-cc6b-4910-abe0-92b1de8fdd2f	75b0ad19-2a3d-468a-b4d8-5b064868b3da	0597703f02e40d3b135af24518cd125144af69069fdf679240cc2f67a6fc157c	2026-09-11 06:15:23.379	\N	\N	2026-08-12 06:15:23.382
4f2f9785-6ba2-48da-a609-e1d8630884e4	20b6c891-02d1-43ab-9ee4-65372be811b2	15e581621f7dff92c309ce47a69881d152efc1f72976639d01e9ca822007969d	2026-09-11 06:20:44.592	\N	\N	2026-08-12 06:20:44.593
584e2d61-0a56-4c23-9b97-9ef750d4a1f1	dce14043-f6ae-4c09-9154-2c79b3025d30	1b1fca6a7fb3811e25082682fe849555b3d7ca5dc31e995f25c0d8dfa86df1b4	2026-09-11 06:20:45.772	\N	\N	2026-08-12 06:20:45.773
21a5e16b-4996-4f9e-8342-58c0ddaf64fd	75b0ad19-2a3d-468a-b4d8-5b064868b3da	39dccdd78ac91cd08265018ca97702b1a2ef876c511dbb488271de65c24a6e20	2026-09-11 06:21:09.991	\N	\N	2026-08-12 06:21:09.992
c0ef4b9b-a73a-4c7e-80db-9c933b18cd3c	75b0ad19-2a3d-468a-b4d8-5b064868b3da	05c31570fb72a36a8b541d22f7052fe1e88f92a30b9d028e9e6e67b1b785857d	2026-09-11 06:21:38.934	\N	\N	2026-08-12 06:21:38.935
a1b675d5-ac94-4c57-8630-4e1432c5209a	20b6c891-02d1-43ab-9ee4-65372be811b2	24a97cb084aab50ccc612d1258236d4283626704b7775cf6add82253d67b6fde	2026-09-11 07:21:19.895	\N	\N	2026-08-12 07:21:19.897
76175a4c-95e5-4c9d-85df-37ae73618e06	20b6c891-02d1-43ab-9ee4-65372be811b2	a308acf75328f14c77da3ba1e705d5b9c892650cd6e0306612d1f305da2d43be	2026-09-11 07:30:00.212	\N	\N	2026-08-12 07:30:00.219
5090a779-805d-496b-93d1-1eb38a45c2cf	20b6c891-02d1-43ab-9ee4-65372be811b2	3a019fde69055a5ca9649a194ff031a916b4f940eb9acb49ff048d01082faca4	2026-09-11 08:39:13.038	\N	\N	2026-08-12 08:39:13.051
0c29ff13-9137-4c98-a7ad-5d1729fe4ab0	20b6c891-02d1-43ab-9ee4-65372be811b2	4eb0562b94ca7874085211a47dcbede1b6b0670fdc659cef654db5bc21bbc4e0	2026-09-11 08:55:25.565	\N	\N	2026-08-12 08:55:25.567
603a4808-f260-4459-9733-2346da49bafd	20b6c891-02d1-43ab-9ee4-65372be811b2	062278484b3b4d0b26a22f8e7bd42e116dcd0e75bf7db889b0d8dd8cd4e96d16	2026-09-13 04:48:41.932	\N	\N	2026-08-14 04:48:41.938
5ec33144-70cf-4b85-9c25-e50c6463a871	20b6c891-02d1-43ab-9ee4-65372be811b2	f9ccf268b8fd1775f988959311b8b04786fdd9323bc79765de75c27acac8f6a1	2026-09-13 06:13:55.866	\N	\N	2026-08-14 06:13:55.874
a4be0e31-1159-49b4-b619-c253b0c85766	20b6c891-02d1-43ab-9ee4-65372be811b2	d1f6b6f8f73c8f2db77fe8487dc2e402b4b4feed76faa97d9303a51e33d2ed94	2026-09-13 06:15:46.369	\N	\N	2026-08-14 06:15:46.37
4fdf86f0-5506-4344-a332-5f07d5286a3f	20b6c891-02d1-43ab-9ee4-65372be811b2	c40cfc09d7ccdff97e4523172739f05a4d0c8dbfed7be3d8a40d95cb052825a7	2026-09-13 06:45:41.305	\N	\N	2026-08-14 06:45:41.309
e1a9221e-cec6-401f-8f9c-c3102df4da2b	20b6c891-02d1-43ab-9ee4-65372be811b2	cdd561a853e1ce0a5a497587b8e88fe58222b6dbbaeaa3c14e2752caf626baa4	2026-09-13 06:58:54.435	\N	\N	2026-08-14 06:58:54.436
590e5bce-0fcc-46f4-a10e-793b3230db06	20b6c891-02d1-43ab-9ee4-65372be811b2	493e1ca2ab48fcb6703b4b7033bac4ea10d9ab162423d80286854df63767137a	2026-09-13 06:39:43.868	2026-08-14 07:06:54.526	9f17f7087d6f86edce86ac502a5f4743e9ba828fdf085465fbc2d148d244172d	2026-08-14 06:39:43.869
b047b5e3-02fd-4827-a9cb-05add82c401c	20b6c891-02d1-43ab-9ee4-65372be811b2	8bd3684322f52a30ae0a46c05515c18bf86b0c6b4d3e5bd5b00354eafa8a1e93	2026-09-13 06:40:04.323	2026-08-14 06:58:54.493	cdd561a853e1ce0a5a497587b8e88fe58222b6dbbaeaa3c14e2752caf626baa4	2026-08-14 06:40:04.324
f0fb8e1f-b875-4d40-a649-55acad5244f2	20b6c891-02d1-43ab-9ee4-65372be811b2	9f17f7087d6f86edce86ac502a5f4743e9ba828fdf085465fbc2d148d244172d	2026-09-13 07:06:54.516	\N	\N	2026-08-14 07:06:54.518
2ec87827-7fcd-4852-8f12-ffb15d5426ab	20b6c891-02d1-43ab-9ee4-65372be811b2	b7456c5e77d77bbf94b663330c55cf928177889686b66dac9750f220a29ad376	2026-09-13 08:26:15.062	\N	\N	2026-08-14 08:26:15.065
963866fc-8345-4ef0-9c45-8d40f35fe7eb	20b6c891-02d1-43ab-9ee4-65372be811b2	7ed8e0b49e8513f7532955ed186d218a293be149448a7da300d70a95c7bde716	2026-09-13 08:26:48.254	\N	\N	2026-08-14 08:26:48.256
bc9e5876-ea66-4451-ae57-f16ac4fe607c	20b6c891-02d1-43ab-9ee4-65372be811b2	5811ec7edf8bb7cea0d7d29550bce77c1b02f15eb81b3dd01bfecd9d4073ba08	2026-09-13 08:27:39.604	\N	\N	2026-08-14 08:27:39.606
1e14a60e-0058-48e2-94bc-5590bd6e8d16	20b6c891-02d1-43ab-9ee4-65372be811b2	9daa227a9b3c529bfbc090e6c454d6f41881bc72b03e93433dc05592e28ecb22	2026-09-13 08:44:12.381	\N	\N	2026-08-14 08:44:12.383
0da50598-873b-4bf1-b861-c9d7a376d983	20b6c891-02d1-43ab-9ee4-65372be811b2	6c1b2c3ec462099bf1d5fd8d71c8ff82ce44a0cfa4daedd297adf817e12e3ec3	2026-09-13 09:50:17.629	\N	\N	2026-08-14 09:50:17.631
a8553fdd-f37e-439b-9e8d-1cad58bbe2d3	20b6c891-02d1-43ab-9ee4-65372be811b2	77c36127e46990a1d489e3ba733125f5855e57a1df3038767ccfd7bcf7530b33	2026-09-17 11:26:21.349	\N	\N	2026-08-18 11:26:21.356
6aa883b8-cd66-48fc-9ca4-be52e04f9f94	20b6c891-02d1-43ab-9ee4-65372be811b2	5e7faf31ce5c6247d1a34b9c144dbf5cc84bc35a9accde5e6b9e6755792c2bc2	2026-09-17 13:03:36.526	\N	\N	2026-08-18 13:03:36.548
d2241a90-a211-45b5-aff9-2115e3ff5c4d	20b6c891-02d1-43ab-9ee4-65372be811b2	ac2ba9af346db941fe758bb75eb2b21e1c18596cf1d9bcc29cf7693d1a14ada9	2026-09-18 04:19:29.065	\N	\N	2026-08-19 04:19:29.067
65f49b03-0450-4858-8e21-54c6ca316ebe	20b6c891-02d1-43ab-9ee4-65372be811b2	b910515817e8c38f0ed8d0c7e16f9bc1809df83b458575f2df9f866dbb6ebe56	2026-09-18 05:15:39.112	\N	\N	2026-08-19 05:15:39.114
20f1c5ba-7554-4cd9-bc9b-ea5c306b1d13	20b6c891-02d1-43ab-9ee4-65372be811b2	27b13996763719a81fec994e43242e3479d507fd1d09933200e17e1a85abba60	2026-09-18 05:18:59.644	\N	\N	2026-08-19 05:18:59.646
0536732f-1821-404d-9fc1-5e5f97268e5e	20b6c891-02d1-43ab-9ee4-65372be811b2	bba290d5e63bd1f889a3053d525a756dd8213e498594e76d4d6dd2b1449f5a31	2026-09-18 05:19:19.315	\N	\N	2026-08-19 05:19:19.319
2502f75f-b39c-472c-82fe-928c3dcb13bb	20b6c891-02d1-43ab-9ee4-65372be811b2	43f79d133211e7738c02b7d223f9ae9488d008d205c09dbe4adca4be2d8729e5	2026-09-18 05:21:09.327	\N	\N	2026-08-19 05:21:09.328
b2b8c82d-2294-4be8-af59-f53f7d68a20b	20b6c891-02d1-43ab-9ee4-65372be811b2	10a0ea774d599b78d53c78512e833b82967a18b23b170a2c6c41baeea8a87212	2026-09-18 05:21:34.555	\N	\N	2026-08-19 05:21:34.557
ef5e36a8-b45d-4df8-b9f0-8c61d0ae8130	20b6c891-02d1-43ab-9ee4-65372be811b2	1121cbe11c78106faf1fdf0404a5a3f1fa87820b269f79cb737f79fa9f75143d	2026-09-18 05:22:43.274	\N	\N	2026-08-19 05:22:43.275
05e0080f-c059-4587-9bf2-440fde93afd9	20b6c891-02d1-43ab-9ee4-65372be811b2	12a81e4a46ad52a1d486f0eab9611d8c8e392b8e5a2842fbad0e4bb6db681d58	2026-09-18 05:23:09.445	\N	\N	2026-08-19 05:23:09.446
a3426d27-355e-4e2c-b367-5276a40f61fe	20b6c891-02d1-43ab-9ee4-65372be811b2	62b4e6ab4d770d5a9a2b7bd34285a69d5b9ed3c833fb58b7b180e0cfe99e9d3b	2026-09-18 05:23:23.252	\N	\N	2026-08-19 05:23:23.253
db81cfab-6d5d-4913-b409-8f61eece0694	20b6c891-02d1-43ab-9ee4-65372be811b2	6ccf8b311cd5ab6f2966684405666dc7d3d690467598a9a547b16d171d65758e	2026-09-18 05:23:36.022	\N	\N	2026-08-19 05:23:36.023
00f70a1c-fb7f-49a2-9eac-cf9a9eb406ba	20b6c891-02d1-43ab-9ee4-65372be811b2	3d77f9fbcdcec56c802638bedfa6d61786e8131609ebcb830d77b14401d5a7d6	2026-09-19 04:42:41.71	\N	\N	2026-08-20 04:42:41.723
d41fc0ff-bbc5-4d87-92f0-66bdc9066372	20b6c891-02d1-43ab-9ee4-65372be811b2	522c2e3cd6e879187043bdd131551426dc4f6b9a65a761252cd7d59469f6528e	2026-09-19 05:47:55.847	\N	\N	2026-08-20 05:47:55.85
19ae907d-42dd-4d75-9d20-9adf04ffcab9	20b6c891-02d1-43ab-9ee4-65372be811b2	35c3527a29820d207ea9cb67f8358c198607534ed224581f364ad1aa06003992	2026-09-19 05:48:40.96	\N	\N	2026-08-20 05:48:40.962
47e416fe-7582-4a24-95d7-c1a69d92d35c	20b6c891-02d1-43ab-9ee4-65372be811b2	48f9fb887eecadde0de3eb7f3d36576568df26b06ef2d86990706e015b016896	2026-09-19 05:49:04.579	\N	\N	2026-08-20 05:49:04.581
895ab98c-4b22-4096-bb93-93c7bac3fd0f	20b6c891-02d1-43ab-9ee4-65372be811b2	a65d7cf5031a0f22cd6e51c995bbd269e1a761157c1274bf14c6a59e38fddf5a	2026-09-19 05:49:20.178	\N	\N	2026-08-20 05:49:20.18
df7f2993-8415-40a8-91ae-5cf476ae09cc	20b6c891-02d1-43ab-9ee4-65372be811b2	61d2a901b484cd8754134dfe18368e4a4cf2daf067b5be3b627c20d83741a612	2026-09-19 05:49:50.664	\N	\N	2026-08-20 05:49:50.665
94c515c8-1d87-4987-bbcb-d09854d025a0	20b6c891-02d1-43ab-9ee4-65372be811b2	774bf46ec3bf847b82d046c55ed73e896e18a99f7d3cbec9f3eab6f42ee2509a	2026-09-19 06:17:26.569	\N	\N	2026-08-20 06:17:26.583
300ddb87-b91c-45ff-90e7-211aa19d1c2c	20b6c891-02d1-43ab-9ee4-65372be811b2	2abbe1fe64fc24eec60615de3f529006e7b80e3037cca22511af5b4c3900dcf9	2026-09-19 06:24:29.729	\N	\N	2026-08-20 06:24:29.731
953ef95a-858f-4ee9-a741-b2b25bec4d6e	20b6c891-02d1-43ab-9ee4-65372be811b2	54b25b9ad935902ad7ce8282e755b1b550730416bc4be50a73eac726be5f193d	2026-09-19 06:25:06.882	\N	\N	2026-08-20 06:25:06.883
9687f467-e2d0-4a62-afc7-97fafc24ed71	20b6c891-02d1-43ab-9ee4-65372be811b2	a8a57654517eb7cce1e1a420faa0ebee2ee95e9fdce619a52566a34af44cb4dd	2026-09-19 06:25:29.953	\N	\N	2026-08-20 06:25:29.957
7a1ad4d4-739e-4f4b-84c1-54ad5957a065	20b6c891-02d1-43ab-9ee4-65372be811b2	bb6795f160b4b9bad09a70c62f885094caa47b3e4f948d290a86e1e1a7350d8a	2026-09-19 06:25:58.619	\N	\N	2026-08-20 06:25:58.624
2415181a-1d41-4060-a1de-553a713a35c6	20b6c891-02d1-43ab-9ee4-65372be811b2	50fd229db07fba33ecc9b9d8e44bf7aec4815142a4e886e4fdd8660d8ae392c6	2026-09-19 07:45:31.287	\N	\N	2026-08-20 07:45:31.289
8779fb60-5e44-4faf-901b-fd6e176a089e	20b6c891-02d1-43ab-9ee4-65372be811b2	f9bf74d56128d5676738653aaa12357c89eff04580cce27bb32be5bfcb98c620	2026-09-20 06:42:39.807	\N	\N	2026-08-21 06:42:39.817
aac4f4f1-a7ff-4dd4-8adc-390a9008d51c	20b6c891-02d1-43ab-9ee4-65372be811b2	98889c45a76f2fe0ca709ac781deb67aadf4921c62f344eec7e5161e30762b7e	2026-09-20 06:43:10.127	\N	\N	2026-08-21 06:43:10.129
898f50ab-9643-4c71-be0f-21429f325e2e	20b6c891-02d1-43ab-9ee4-65372be811b2	e73835382de79b2928f227e492e08408ff9182c2ca4696792990217be43f2f99	2026-09-20 06:48:45.624	\N	\N	2026-08-21 06:48:45.625
e42aa523-0a34-426c-967e-6dac86113ea4	20b6c891-02d1-43ab-9ee4-65372be811b2	a5aae662a85983086d6aa2dd2c06167cc753ce7c4c424b9e7c1569d4b24b59e1	2026-09-20 06:51:57.022	\N	\N	2026-08-21 06:51:57.023
b51f1ed7-f082-4dad-931f-a03cbc9097e8	20b6c891-02d1-43ab-9ee4-65372be811b2	76d484d9b00615b68b20d45445398442779ac2d71d21a5f04f79da1ac4b68ada	2026-09-20 06:53:35.144	\N	\N	2026-08-21 06:53:35.145
65922356-2b86-415b-945b-460039c148ad	20b6c891-02d1-43ab-9ee4-65372be811b2	155464ae7f23ce6590fdf845e617115d2e67c3908cbdb8b7846dffae1f732da4	2026-09-20 07:01:31.317	\N	\N	2026-08-21 07:01:31.323
3c3a764e-f94a-4bc8-b8db-f1ce94e485b9	20b6c891-02d1-43ab-9ee4-65372be811b2	ac7e5a4957a412757bfd6e096d2469a084a1c9971a5c2342adc013c0469eb07a	2026-09-20 11:59:54.101	\N	\N	2026-08-21 11:59:54.103
\.


--
-- Data for Name: refund_requests; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.refund_requests (id, "bookingId", "paymentId", amount, reason, status, "processedAt") FROM stdin;
2cbd2f31-08a8-432f-87b3-91bd7cc8c361	166c002e-e168-448d-91f9-8f96d5609783	0e9f75b7-d185-4b0c-97f0-0a292e7e5d9f	20000.00	Partial cancellation - one traveler dropped	PROCESSED	2026-08-11 10:07:07.154
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.reviews (id, "tenantId", "packageId", "customerId", "authorName", rating, title, comment, status, "createdAt") FROM stdin;
2108dca8-9308-42c0-89b1-46b1c03c3a5e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	60b2a309-7fa5-4c73-9f9e-f0db9189cbcb	\N	Rahul S.	5	Amazing trip	Loved every moment of it.	APPROVED	2026-08-11 07:33:47.756
7c8c7aa8-77f0-4642-933e-c089d9d37a92	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	5a8810cd-87b6-4d87-8434-a5e84705284b	df5b2d4b-88ee-4ed8-a78a-101e995204ad	Traveler	5	\N	Great trip!	APPROVED	2026-08-11 12:17:00.556
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	827b913e-ce19-4f2b-b7c0-bfccfc4d3eaa
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	641da365-9031-400b-91f4-c6d2d22a9a58
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	cf9080d9-61fd-4262-8bb8-026aee0c36ae
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	4dddcd8c-8412-44e4-ba07-6cdfb02de667
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	7e11b453-42ca-452d-a516-605deac41829
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	f0ef3f97-6e5b-476b-b00a-248a179b66af
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	34e84749-d689-473e-9740-bf56d9355e9d
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	5716028a-3fbc-40fc-909e-471c8c075942
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	6c2c214f-a74c-47b6-af91-2dcd2fa77594
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	17fdd07b-3e7f-419a-a7eb-5108ca06f599
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	03b2821e-b81f-47bd-9e16-beeb3a3302b2
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	fa6a2ad3-806e-4ce6-a1ec-8a5d4023e2c7
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	8a16b3b2-2711-46f5-b4b9-cb5473bb8503
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	fb6e996f-fd73-45a7-9baf-4836740e72a6
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	8acafd16-6d67-4507-b583-d2ef49000d92
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	36c4f883-af5d-4737-9b0b-96fa03954dad
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	46dbfb4e-02ab-4b51-bde6-4b7dbfb88cb9
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	76153110-b5c7-4ada-b8ab-0d16f49ea4eb
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	f1d81748-7a58-402e-950c-530ed7b4c3e3
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	fee2aa5a-de0a-47a0-9ca8-1113dc294fbd
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	4dddcd8c-8412-44e4-ba07-6cdfb02de667
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	7e11b453-42ca-452d-a516-605deac41829
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	f0ef3f97-6e5b-476b-b00a-248a179b66af
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	34e84749-d689-473e-9740-bf56d9355e9d
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	5716028a-3fbc-40fc-909e-471c8c075942
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	6c2c214f-a74c-47b6-af91-2dcd2fa77594
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	17fdd07b-3e7f-419a-a7eb-5108ca06f599
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	03b2821e-b81f-47bd-9e16-beeb3a3302b2
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	fb6e996f-fd73-45a7-9baf-4836740e72a6
56375575-af71-4bfe-b36e-e3d26d8e6975	827b913e-ce19-4f2b-b7c0-bfccfc4d3eaa
56375575-af71-4bfe-b36e-e3d26d8e6975	641da365-9031-400b-91f4-c6d2d22a9a58
56375575-af71-4bfe-b36e-e3d26d8e6975	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
56375575-af71-4bfe-b36e-e3d26d8e6975	cf9080d9-61fd-4262-8bb8-026aee0c36ae
56375575-af71-4bfe-b36e-e3d26d8e6975	4dddcd8c-8412-44e4-ba07-6cdfb02de667
56375575-af71-4bfe-b36e-e3d26d8e6975	7e11b453-42ca-452d-a516-605deac41829
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	5716028a-3fbc-40fc-909e-471c8c075942
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	f0ef3f97-6e5b-476b-b00a-248a179b66af
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	4dddcd8c-8412-44e4-ba07-6cdfb02de667
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
b384b04c-baa1-4f2d-99b4-d1c4d650d509	fa6a2ad3-806e-4ce6-a1ec-8a5d4023e2c7
b384b04c-baa1-4f2d-99b4-d1c4d650d509	8a16b3b2-2711-46f5-b4b9-cb5473bb8503
b384b04c-baa1-4f2d-99b4-d1c4d650d509	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
b384b04c-baa1-4f2d-99b4-d1c4d650d509	fb6e996f-fd73-45a7-9baf-4836740e72a6
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	0fdb555b-fc89-42f0-82a7-c6b65839dce1
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	f8174f61-ca4d-4ff9-aba6-7bf2b6f21875
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	fcb71388-6aca-40bb-bf4b-3ed241e43646
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	0fdb555b-fc89-42f0-82a7-c6b65839dce1
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	f8174f61-ca4d-4ff9-aba6-7bf2b6f21875
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	fcb71388-6aca-40bb-bf4b-3ed241e43646
56375575-af71-4bfe-b36e-e3d26d8e6975	0fdb555b-fc89-42f0-82a7-c6b65839dce1
56375575-af71-4bfe-b36e-e3d26d8e6975	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	827b913e-ce19-4f2b-b7c0-bfccfc4d3eaa
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	641da365-9031-400b-91f4-c6d2d22a9a58
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	cf9080d9-61fd-4262-8bb8-026aee0c36ae
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	4dddcd8c-8412-44e4-ba07-6cdfb02de667
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	7e11b453-42ca-452d-a516-605deac41829
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	0fdb555b-fc89-42f0-82a7-c6b65839dce1
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	f8174f61-ca4d-4ff9-aba6-7bf2b6f21875
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	fcb71388-6aca-40bb-bf4b-3ed241e43646
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	f0ef3f97-6e5b-476b-b00a-248a179b66af
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	34e84749-d689-473e-9740-bf56d9355e9d
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	5716028a-3fbc-40fc-909e-471c8c075942
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	6c2c214f-a74c-47b6-af91-2dcd2fa77594
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	17fdd07b-3e7f-419a-a7eb-5108ca06f599
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	03b2821e-b81f-47bd-9e16-beeb3a3302b2
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	fa6a2ad3-806e-4ce6-a1ec-8a5d4023e2c7
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	8a16b3b2-2711-46f5-b4b9-cb5473bb8503
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	fb6e996f-fd73-45a7-9baf-4836740e72a6
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	8acafd16-6d67-4507-b583-d2ef49000d92
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	36c4f883-af5d-4737-9b0b-96fa03954dad
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	46dbfb4e-02ab-4b51-bde6-4b7dbfb88cb9
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	76153110-b5c7-4ada-b8ab-0d16f49ea4eb
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	f1d81748-7a58-402e-950c-530ed7b4c3e3
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	fee2aa5a-de0a-47a0-9ca8-1113dc294fbd
5e4383ed-f643-4d08-9135-0e2b8690bcfb	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
5e4383ed-f643-4d08-9135-0e2b8690bcfb	4dddcd8c-8412-44e4-ba07-6cdfb02de667
5e4383ed-f643-4d08-9135-0e2b8690bcfb	7e11b453-42ca-452d-a516-605deac41829
5e4383ed-f643-4d08-9135-0e2b8690bcfb	0fdb555b-fc89-42f0-82a7-c6b65839dce1
5e4383ed-f643-4d08-9135-0e2b8690bcfb	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
5e4383ed-f643-4d08-9135-0e2b8690bcfb	f8174f61-ca4d-4ff9-aba6-7bf2b6f21875
5e4383ed-f643-4d08-9135-0e2b8690bcfb	fcb71388-6aca-40bb-bf4b-3ed241e43646
5e4383ed-f643-4d08-9135-0e2b8690bcfb	f0ef3f97-6e5b-476b-b00a-248a179b66af
5e4383ed-f643-4d08-9135-0e2b8690bcfb	34e84749-d689-473e-9740-bf56d9355e9d
5e4383ed-f643-4d08-9135-0e2b8690bcfb	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
5e4383ed-f643-4d08-9135-0e2b8690bcfb	5716028a-3fbc-40fc-909e-471c8c075942
5e4383ed-f643-4d08-9135-0e2b8690bcfb	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
5e4383ed-f643-4d08-9135-0e2b8690bcfb	6c2c214f-a74c-47b6-af91-2dcd2fa77594
5e4383ed-f643-4d08-9135-0e2b8690bcfb	17fdd07b-3e7f-419a-a7eb-5108ca06f599
5e4383ed-f643-4d08-9135-0e2b8690bcfb	03b2821e-b81f-47bd-9e16-beeb3a3302b2
5e4383ed-f643-4d08-9135-0e2b8690bcfb	fb6e996f-fd73-45a7-9baf-4836740e72a6
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	827b913e-ce19-4f2b-b7c0-bfccfc4d3eaa
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	641da365-9031-400b-91f4-c6d2d22a9a58
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	cf9080d9-61fd-4262-8bb8-026aee0c36ae
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	4dddcd8c-8412-44e4-ba07-6cdfb02de667
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	7e11b453-42ca-452d-a516-605deac41829
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	0fdb555b-fc89-42f0-82a7-c6b65839dce1
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	c2bd7cf6-b3aa-433a-8e13-460e959d4a25
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	dfb2e58a-7f6b-491f-bbf2-56bdadc85a9f
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	5716028a-3fbc-40fc-909e-471c8c075942
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	f0ef3f97-6e5b-476b-b00a-248a179b66af
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	4dddcd8c-8412-44e4-ba07-6cdfb02de667
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	4d8a20fb-36dd-4811-a3c0-5fac08c0de0f
a8c1136c-58e4-4a19-acfc-75fe9ae1b35e	fa6a2ad3-806e-4ce6-a1ec-8a5d4023e2c7
a8c1136c-58e4-4a19-acfc-75fe9ae1b35e	8a16b3b2-2711-46f5-b4b9-cb5473bb8503
a8c1136c-58e4-4a19-acfc-75fe9ae1b35e	4ca5ea7a-919f-4b03-89c0-973bc279f9ee
a8c1136c-58e4-4a19-acfc-75fe9ae1b35e	fb6e996f-fd73-45a7-9baf-4836740e72a6
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.roles (id, "tenantId", name, "isSystem") FROM stdin;
db2f30b3-ad0d-4f2f-ae6d-e4ba10b0eec1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	SuperAdmin	t
a5d1021e-1539-48e6-8c67-68e7c22f9b7a	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	OpsManager	t
56375575-af71-4bfe-b36e-e3d26d8e6975	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	ContentEditor	t
e2d34b11-9f5a-49c2-91d0-99d06fe8de17	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Consultant	t
b384b04c-baa1-4f2d-99b4-d1c4d650d509	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	FinanceOfficer	t
eb8fb0d0-1eea-41cd-885a-8e36ac873ef1	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	SuperAdmin	t
5e4383ed-f643-4d08-9135-0e2b8690bcfb	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	OpsManager	t
0b7853dd-b819-4aa6-aa8c-172d7cbc08e3	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	ContentEditor	t
c6f23c5c-e8e3-4e5f-9274-f9927ece3aba	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	Consultant	t
a8c1136c-58e4-4a19-acfc-75fe9ae1b35e	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	FinanceOfficer	t
\.


--
-- Data for Name: seasonal_rates; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.seasonal_rates (id, "packageId", "startDate", "endDate", "priceModifierType", value) FROM stdin;
\.


--
-- Data for Name: seo_meta; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.seo_meta (id, "entityType", "entityId", title, description, "ogImageKey", "canonicalUrl", "schemaJson") FROM stdin;
\.


--
-- Data for Name: sitemap_entries; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.sitemap_entries (id, url, "lastModified", priority) FROM stdin;
2653d463-8642-46b6-a9a8-50ebf5484212	/packages/kerala-backwaters-munnar-family-escape	2026-08-20 06:25:59.592	0.8
c7b9e421-34e3-40ce-9b51-dc9d5d6d7a3f	/packages/phuket-honeymoon-escape	2026-08-20 06:25:59.65	0.8
d6a6a1e6-05a3-4558-b8b3-2531f62d6299	/packages/bali-honeymoon-escape	2026-08-21 06:53:35.422	0.8
9b097b0c-42b2-4300-84cb-2355785c2a6a	/packages/maldives-overwater-villa-retreat	2026-08-21 06:53:35.94	0.8
d769eac9-ba9e-4ab6-b9f7-3ddbc817a2eb	/packages/dubai-city-desert-explorer	2026-08-21 06:53:36.501	0.8
f96b9574-c461-4097-a225-f82c02f2f890	/packages/bangkok-street-food-temples-trail	2026-08-21 06:53:36.728	0.8
c2a2c08f-21f3-4406-8e41-9d69d5dd863e	/packages/interlaken-alpine-adventure	2026-08-21 06:53:36.916	0.8
121facea-2d81-4fed-81fc-59482e8a0d4d	/packages/kerala-backwater-serenity	2026-08-21 06:53:37.11	0.8
a7ac9de0-019e-4f57-8aa7-92977f80693f	/packages/rajasthan-royal-trail	2026-08-21 06:53:37.242	0.8
f931ec79-08bc-4d92-8d50-9c3da86efac1	/packages/singapore-family-discovery	2026-08-21 06:53:37.565	0.8
aa24ab37-dfa3-4ece-9101-97a10a62f4f4	/packages/goa-long-weekend	2026-08-21 06:53:37.746	0.8
692d8a92-ddcd-4b22-a9d3-fc7eef4d52e2	/packages/shimla-manali-adventure-trail	2026-08-21 06:53:37.962	0.8
ace8a98a-571a-413a-bfd4-8918fb0182b9	/packages/europe-highlights-paris-swiss-rome	2026-08-21 06:53:38.089	0.8
cd0177f1-892d-4fd5-b08c-f497831fa850	/packages/vietnam-discovery	2026-08-21 06:53:38.146	0.8
415ca8d9-c049-4d5c-a4ca-57e3bfee1aa2	/blog/bali-7-day-itinerary	2026-08-21 07:01:31.396	0.5
de2069fa-8fe8-497e-b517-772466744187	/blog/maldives-resort-choice	2026-08-21 07:01:31.414	0.5
8cc56e13-2d6f-4054-ad57-0f8f73f1545b	/blog/schengen-visa-checklist	2026-08-21 07:01:31.44	0.5
37f380e0-5894-4693-a474-961ab66f79cd	/blog/family-travel-pace	2026-08-21 07:01:31.455	0.5
49ab0284-f05e-40bf-8cb8-6a58522ddfbf	/blog/best-time-southeast-asia	2026-08-21 07:01:31.472	0.5
56c38c10-14b2-4837-ba6c-74fe13f97faa	/blog/adventure-himachal	2026-08-21 07:01:31.489	0.5
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.subscriptions (id, "tenantId", "planId", status, "razorpaySubscriptionId", "currentPeriodEnd", "createdAt") FROM stdin;
2d2fe18f-53d9-47c6-afd1-e612068fba7d	81d175e9-d392-4f48-b13a-86fb6d7b9e8e	17539795-6c27-4ab3-a257-a04903802675	ACTIVE	mock_sub_99ba336d-56a4-4f53-8290-36c5f90c7668	2026-09-12 06:21:40.118	2026-08-12 06:15:23.207
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.tasks (id, "tenantId", "assignedToId", "relatedEntityType", "relatedEntityId", title, "dueDate", status, priority) FROM stdin;
6cda43a8-05e6-434e-b425-2fbfc5134585	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	20b6c891-02d1-43ab-9ee4-65372be811b2	\N	\N	Follow up on Bali quote	2026-08-18 00:00:00	OPEN	HIGH
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.tenants (id, name, slug, "createdAt", "updatedAt", "customDomain", "logoStorageKey", "primaryColor", "templateSlug", status, "razorpayKeyId", "razorpayKeySecretEncrypted", "twilioAccountSid", "twilioAuthTokenEncrypted", "twilioFromNumber", "twilioWhatsappFromNumber", "facebookPixelId", "ga4MeasurementId", "googleClientId", "googleClientSecretEncrypted", "googleMapsApiKey", "s3AccessKeyId", "s3Bucket", "s3PublicBaseUrl", "s3Region", "s3SecretAccessKeyEncrypted", "smtpFromEmail", "smtpHost", "smtpPasswordEncrypted", "smtpPort", "smtpUser") FROM stdin;
81d175e9-d392-4f48-b13a-86fb6d7b9e8e	Wanderlust Travels	wanderlust	2026-08-12 06:15:22.877	2026-08-12 06:21:39.429	\N	\N	#8b2fc9	modern	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Paxbook	default	2026-08-08 08:48:58.99	2026-08-19 05:15:39.271	\N	06843db4-2d83-4ce5-9a75-438f21ef2664-logo.jpg	#19377F	classic	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.testimonials (id, "tenantId", "customerName", rating, content, "imageKey", "isFeatured") FROM stdin;
17a07e96-dc16-483e-a5ae-5deed72158d1	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Bhupendra Singh, Porbandar	5	After reading and learning so much about Mahatma Gandhi, visiting his birthplace in Gujarat was a deeply meaningful experience for me. Huge thanks to Paxbook for seamlessly organizing this special journey and making it truly unforgettable!	\N	t
b66cb4c4-5a85-4493-8576-242a717ef98e	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Ankit Mewara, Manali	5	Breathtaking views, wonderful vibes, and top-tier service! Huge thanks to Paxbook for organizing an amazing trip to Manali. Paxbook took care of every single detail so we could just relax and soak in the mountain vibes.	\N	t
9e32c03e-4040-4fc7-8ff1-98f18d405515	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Ramavtar Meena, Trimbakeshwar	5	4 Jyotirlingas, endless blessings, and 1 seamless trip! Couldn't have completed this journey across Mahakaleshwar, Omkareshwar, Trimbakeshwar and Grishneshwar without the fantastic support of Paxbook. Highly recommend Paxbook for anyone planning a hassle-free religious circuit!	\N	t
43156672-4458-4791-8c93-a18ac91c9a04	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Sheetal Nagar	5	It was my best decision to book a holiday package with Paxbook. My travel expert gave me the best service, exactly as promised — best food, best stay, and a most memorable trip. Thank you Paxbook!	\N	t
\.


--
-- Data for Name: travelers; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.travelers (id, "customerId", name, dob, "passportNumber", nationality) FROM stdin;
1aa4abe6-92ed-44b4-9d01-fea874c79a32	5515c807-08fe-4d19-b467-c02264cce0f7	Anita Sharma	\N	P1234567	Indian
8cad87f9-dab8-414b-9045-5bf6d92a1ffb	5515c807-08fe-4d19-b467-c02264cce0f7	Rohan Sharma	\N	\N	Indian
\.


--
-- Data for Name: vendor_contracts; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.vendor_contracts (id, "vendorId", "startDate", "endDate", terms, "commissionRate", "storageKey") FROM stdin;
0fb49b95-44d6-4195-be5e-be34bcb7c851	27436adf-9dfc-486d-ba40-12a04cba9903	2026-01-01 00:00:00	2026-12-31 00:00:00	Net rate + 12.5% commission	12.50	test-vendor-uploaded-doc.pdf
\.


--
-- Data for Name: vendor_payments; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.vendor_payments (id, "vendorId", "bookingId", amount, status, "paidAt") FROM stdin;
0b2b2f54-c4f9-4b15-a45d-554a5f58ed7e	27436adf-9dfc-486d-ba40-12a04cba9903	166c002e-e168-448d-91f9-8f96d5609783	28000.00	PAID	2026-08-11 10:17:57.366
\.


--
-- Data for Name: vendor_refresh_tokens; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.vendor_refresh_tokens (id, "vendorId", "tokenHash", "expiresAt", "revokedAt", "replacedBy", "createdAt") FROM stdin;
9548f5e8-eec3-4464-956e-4d0834893597	27436adf-9dfc-486d-ba40-12a04cba9903	bb592796abb9289018eda43533bf07a0d7599ad24453d90fb8285634146c3cca	2026-09-10 12:52:41.981	\N	\N	2026-08-11 12:52:41.986
523c759f-ba14-4bd9-b418-d3bb5b8a0218	27436adf-9dfc-486d-ba40-12a04cba9903	7699828af2cfa7e71c134ce5df7c66357a5431277acb591b452325e41d5d3073	2026-09-10 12:53:28.535	\N	\N	2026-08-11 12:53:28.54
3a362650-3e92-4201-a7d7-f3e9bc5814d0	abb87a3f-29ea-4135-9668-f4c83f080930	93a6d3412898246f3a3b9e918ca88507d66b94cb6eebdd26b9593dd67053bf38	2026-09-10 12:53:47.206	\N	\N	2026-08-11 12:53:47.208
7b4c8bcc-e6f5-4c01-a6c2-d8f195a1072a	abb87a3f-29ea-4135-9668-f4c83f080930	d2d3f3b7c97e22162c7e418b189ea01ba8f844cd1c718318df9066fb626f5b85	2026-09-10 12:54:00.829	\N	\N	2026-08-11 12:54:00.832
8fcceddc-2cfe-4d47-b15c-bb46b8f819ce	27436adf-9dfc-486d-ba40-12a04cba9903	69808c5cacb63730e58240e917f641af48a3aff4bca5e60becc30b00966e8e4e	2026-09-11 06:26:49.236	\N	\N	2026-08-12 06:26:49.237
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.vendors (id, "tenantId", name, "categoryType", "contactInfo", status, email, "passwordHash") FROM stdin;
abb87a3f-29ea-4135-9668-f4c83f080930	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Phi Phi Snorkel Tours	ACTIVITY	\N	ACTIVE	phiphi.tours@example.com	$argon2id$v=19$m=65536,t=3,p=4$hkf3NVTnl7SOEbGJfRCswA$S47lEtEGvPX/vK1OnS/iNNvvyP87gCLaAONf/AYHwiA
27436adf-9dfc-486d-ba40-12a04cba9903	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	Patong Beach Resort	HOTEL	Front desk: +66-76-000-111	ACTIVE	patong.hotel@example.com	$argon2id$v=19$m=65536,t=3,p=4$76X+gkOj/HkCLPxkE2HxCQ$h9wd6n2JUK5t7/KisTxfrcGdGFv5izouBkJa4VJm9E0
\.


--
-- Data for Name: visa_info; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.visa_info (id, "countryId", "visaType", "processingTime", "visaFee", currency, notes, "updatedAt", "isVisaFree", "requiredDocuments") FROM stdin;
7b914511-ed88-4e72-a208-8274a1bb516a	6dfc27c2-1f08-46fb-b3c9-5fc166cbcbde	Tourist e-Visa	3 – 5 working days	\N	INR	\N	2026-08-20 07:45:31.428	f	{"Passport with 6 months validity","Passport size photograph","Confirmed flight & hotel booking"}
63aa27a1-b60a-4152-9aae-9d7c42014fbd	fd3d8dc0-5f4c-47c2-a500-f3ccb8b14995	Visa exemption for tourists	On arrival	2000.00	INR	\N	2026-08-20 07:45:31.464	t	{"Passport with 6 months validity","Return ticket","Proof of accommodation"}
6b57e593-ae01-44d3-b48e-92df0ded9361	41f88819-174f-4932-a283-11569951c20a	Tourist e-Visa	4 – 7 working days	\N	INR	\N	2026-08-20 07:45:31.49	f	{"Passport copy","Photograph as per spec","Bank statement","Confirmed itinerary"}
0d258d2c-91fe-41a3-97b2-8a4c1ec1ac95	c6d88296-0db9-401c-a25d-08694f5ff6b2	Free visa on arrival	On arrival	0.00	INR	\N	2026-08-20 07:45:31.516	t	{"Passport with 1 month validity","Confirmed resort booking","Return ticket"}
fd8f667a-4dc7-4e16-b8b1-d63f77271fb4	1f75f43e-cbe1-41f0-8cf0-3cd080586511	e-Visa	3 – 5 working days	\N	INR	\N	2026-08-20 07:45:31.533	f	{"Passport scan","Digital photograph","Travel dates & entry port"}
dee9a40d-40ba-44b8-acbb-5949960eae0f	d64f23b4-8684-41e0-b0e3-739bf0c30a7a	Schengen short-stay visa	15 – 25 working days	\N	INR	\N	2026-08-20 07:45:31.548	f	{"Application form","Bank statements (6 months)",ITR,"Travel insurance","Confirmed bookings"}
ecf35bd6-a85d-4ae1-b927-cb6cdf136d99	260f1c6c-0987-4101-be33-00795c9e95ed	ETA	1 – 3 working days	\N	INR	\N	2026-08-20 07:45:31.566	t	{"Passport copy","Return ticket","Accommodation details"}
8364b7c0-140e-495b-a6ae-87ed30a36451	2b1ac0d6-fdfe-4e8c-9076-0fc317a82301	Entry permit for Indian nationals	2 – 4 working days	\N	INR	\N	2026-08-20 07:45:31.582	t	{"Passport or voter ID",Photograph,"Hotel & guide confirmation"}
a2f5707e-7c87-420a-8fe4-db381aa56a0c	3a0819ff-2ceb-49b9-9605-2de701abd818	Visa on arrival	On arrival	0.00	INR	\N	2026-08-20 07:45:31.6	t	{"Passport with 6 months validity","Return ticket","Proof of accommodation"}
567bad10-3bf7-4f00-9798-b977f6bc4766	f62c9849-c9ed-4836-a657-db755502a035	Visa-free entry window	On arrival	\N	INR	\N	2026-08-20 07:45:31.613	t	{"Passport with 6 months validity","Return ticket","Proof of funds"}
8145d205-c09d-4b61-aa3e-5e85726f228d	1c5c825e-ba41-4bf9-a15b-caa9b04f305d	Visa on arrival	On arrival	\N	INR	\N	2026-08-20 07:45:31.628	f	{"Passport with 6 months validity","Return ticket"}
97591f3c-faa4-4f79-b37f-7af04890b2f9	4af9d23d-1fdd-46d9-94ea-e40837863259	Tourist visa	5 – 7 working days	\N	INR	\N	2026-08-20 07:45:31.645	f	{"Passport copy",Photograph,"Bank statement","Travel itinerary"}
29bd19fb-fb96-470a-a08f-ce9d5808c948	9cf6cf88-e6d2-4047-a349-1d394af954ac	Schengen short-stay visa	15 – 25 working days	\N	INR	\N	2026-08-20 07:45:31.666	f	{"Application form","Bank statements (6 months)",ITR,"Travel insurance","Confirmed bookings"}
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.vouchers (id, "bookingId", "storageKey", "generatedAt") FROM stdin;
58b64802-a23b-44b0-bf69-6d437200a946	166c002e-e168-448d-91f9-8f96d5609783	fd531503-7ef1-4aa4-845a-28a323e208fc-pixel.png	2026-08-11 09:35:14.98
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: paxbook
--

COPY public.wishlist_items (id, "tenantId", "customerId", "packageId", "createdAt") FROM stdin;
ff852fcc-1219-491a-82e4-b99e6d84c7c6	7b95aeff-5497-4253-a7f0-17bf5fcce0a8	df5b2d4b-88ee-4ed8-a78a-101e995204ad	5a8810cd-87b6-4d87-8434-a5e84705284b	2026-08-11 12:17:00.175
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: booking_status_history booking_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_pkey PRIMARY KEY (id);


--
-- Name: booking_travelers booking_travelers_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_travelers
    ADD CONSTRAINT booking_travelers_pkey PRIMARY KEY ("bookingId", "travelerId");


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cancellation_requests cancellation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.cancellation_requests
    ADD CONSTRAINT cancellation_requests_pkey PRIMARY KEY (id);


--
-- Name: consultants consultants_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.consultants
    ADD CONSTRAINT consultants_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customer_documents customer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customer_documents
    ADD CONSTRAINT customer_documents_pkey PRIMARY KEY (id);


--
-- Name: customer_refresh_tokens customer_refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customer_refresh_tokens
    ADD CONSTRAINT customer_refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: destination_activities destination_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_activities
    ADD CONSTRAINT destination_activities_pkey PRIMARY KEY (id);


--
-- Name: destination_categories destination_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_categories
    ADD CONSTRAINT destination_categories_pkey PRIMARY KEY (id);


--
-- Name: destination_category_map destination_category_map_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_category_map
    ADD CONSTRAINT destination_category_map_pkey PRIMARY KEY ("destinationId", "categoryId");


--
-- Name: destination_highlights destination_highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_highlights
    ADD CONSTRAINT destination_highlights_pkey PRIMARY KEY (id);


--
-- Name: destination_hotel_suggestions destination_hotel_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_hotel_suggestions
    ADD CONSTRAINT destination_hotel_suggestions_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: emi_plans emi_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.emi_plans
    ADD CONSTRAINT emi_plans_pkey PRIMARY KEY (id);


--
-- Name: faq_items faq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.faq_items
    ADD CONSTRAINT faq_items_pkey PRIMARY KEY (id);


--
-- Name: homepage_blocks homepage_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.homepage_blocks
    ADD CONSTRAINT homepage_blocks_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: itinerary_days itinerary_days_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT itinerary_days_pkey PRIMARY KEY (id);


--
-- Name: lead_follow_ups lead_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.lead_follow_ups
    ADD CONSTRAINT lead_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: package_activities package_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_activities
    ADD CONSTRAINT package_activities_pkey PRIMARY KEY (id);


--
-- Name: package_flights package_flights_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_flights
    ADD CONSTRAINT package_flights_pkey PRIMARY KEY (id);


--
-- Name: package_gallery_images package_gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_gallery_images
    ADD CONSTRAINT package_gallery_images_pkey PRIMARY KEY (id);


--
-- Name: package_hotels package_hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_hotels
    ADD CONSTRAINT package_hotels_pkey PRIMARY KEY (id);


--
-- Name: package_pricing_tiers package_pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_pricing_tiers
    ADD CONSTRAINT package_pricing_tiers_pkey PRIMARY KEY (id);


--
-- Name: package_route_map_points package_route_map_points_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_route_map_points
    ADD CONSTRAINT package_route_map_points_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refund_requests refund_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: seasonal_rates seasonal_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.seasonal_rates
    ADD CONSTRAINT seasonal_rates_pkey PRIMARY KEY (id);


--
-- Name: seo_meta seo_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.seo_meta
    ADD CONSTRAINT seo_meta_pkey PRIMARY KEY (id);


--
-- Name: sitemap_entries sitemap_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.sitemap_entries
    ADD CONSTRAINT sitemap_entries_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: travelers travelers_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.travelers
    ADD CONSTRAINT travelers_pkey PRIMARY KEY (id);


--
-- Name: vendor_contracts vendor_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_contracts
    ADD CONSTRAINT vendor_contracts_pkey PRIMARY KEY (id);


--
-- Name: vendor_payments vendor_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_pkey PRIMARY KEY (id);


--
-- Name: vendor_refresh_tokens vendor_refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_refresh_tokens
    ADD CONSTRAINT vendor_refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: visa_info visa_info_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.visa_info
    ADD CONSTRAINT visa_info_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: admin_users_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "admin_users_tenantId_idx" ON public.admin_users USING btree ("tenantId");


--
-- Name: audit_logs_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON public.audit_logs USING btree ("tenantId", "createdAt");


--
-- Name: banners_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "banners_tenantId_idx" ON public.banners USING btree ("tenantId");


--
-- Name: blog_posts_tenantId_slug_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "blog_posts_tenantId_slug_key" ON public.blog_posts USING btree ("tenantId", slug);


--
-- Name: bookings_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "bookings_tenantId_idx" ON public.bookings USING btree ("tenantId");


--
-- Name: consultants_adminUserId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "consultants_adminUserId_key" ON public.consultants USING btree ("adminUserId");


--
-- Name: countries_iso2_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX countries_iso2_key ON public.countries USING btree (iso2);


--
-- Name: coupons_tenantId_code_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "coupons_tenantId_code_key" ON public.coupons USING btree ("tenantId", code);


--
-- Name: coupons_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "coupons_tenantId_idx" ON public.coupons USING btree ("tenantId");


--
-- Name: customer_refresh_tokens_customerId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "customer_refresh_tokens_customerId_idx" ON public.customer_refresh_tokens USING btree ("customerId");


--
-- Name: customer_refresh_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "customer_refresh_tokens_tokenHash_key" ON public.customer_refresh_tokens USING btree ("tokenHash");


--
-- Name: customers_tenantId_email_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "customers_tenantId_email_key" ON public.customers USING btree ("tenantId", email);


--
-- Name: customers_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "customers_tenantId_idx" ON public.customers USING btree ("tenantId");


--
-- Name: customers_tenantId_phone_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "customers_tenantId_phone_key" ON public.customers USING btree ("tenantId", phone);


--
-- Name: destination_activities_destinationId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "destination_activities_destinationId_idx" ON public.destination_activities USING btree ("destinationId");


--
-- Name: destination_categories_name_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX destination_categories_name_key ON public.destination_categories USING btree (name);


--
-- Name: destination_highlights_destinationId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "destination_highlights_destinationId_idx" ON public.destination_highlights USING btree ("destinationId");


--
-- Name: destination_hotel_suggestions_destinationId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "destination_hotel_suggestions_destinationId_idx" ON public.destination_hotel_suggestions USING btree ("destinationId");


--
-- Name: destinations_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "destinations_tenantId_idx" ON public.destinations USING btree ("tenantId");


--
-- Name: destinations_tenantId_slug_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "destinations_tenantId_slug_key" ON public.destinations USING btree ("tenantId", slug);


--
-- Name: emi_plans_bookingId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "emi_plans_bookingId_key" ON public.emi_plans USING btree ("bookingId");


--
-- Name: faq_items_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "faq_items_tenantId_idx" ON public.faq_items USING btree ("tenantId");


--
-- Name: homepage_blocks_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "homepage_blocks_tenantId_idx" ON public.homepage_blocks USING btree ("tenantId");


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "invoices_tenantId_idx" ON public.invoices USING btree ("tenantId");


--
-- Name: itinerary_days_packageId_dayNumber_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "itinerary_days_packageId_dayNumber_key" ON public.itinerary_days USING btree ("packageId", "dayNumber");


--
-- Name: leads_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "leads_tenantId_idx" ON public.leads USING btree ("tenantId");


--
-- Name: notifications_tenantId_customerId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "notifications_tenantId_customerId_idx" ON public.notifications USING btree ("tenantId", "customerId");


--
-- Name: otp_codes_subjectType_subjectId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "otp_codes_subjectType_subjectId_idx" ON public.otp_codes USING btree ("subjectType", "subjectId");


--
-- Name: packages_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "packages_tenantId_idx" ON public.packages USING btree ("tenantId");


--
-- Name: packages_tenantId_slug_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "packages_tenantId_slug_key" ON public.packages USING btree ("tenantId", slug);


--
-- Name: pages_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "pages_tenantId_idx" ON public.pages USING btree ("tenantId");


--
-- Name: pages_tenantId_slug_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "pages_tenantId_slug_key" ON public.pages USING btree ("tenantId", slug);


--
-- Name: payments_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "payments_tenantId_idx" ON public.payments USING btree ("tenantId");


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: plans_name_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX plans_name_key ON public.plans USING btree (name);


--
-- Name: refresh_tokens_adminUserId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "refresh_tokens_adminUserId_idx" ON public.refresh_tokens USING btree ("adminUserId");


--
-- Name: refresh_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON public.refresh_tokens USING btree ("tokenHash");


--
-- Name: reviews_packageId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "reviews_packageId_idx" ON public.reviews USING btree ("packageId");


--
-- Name: reviews_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "reviews_tenantId_idx" ON public.reviews USING btree ("tenantId");


--
-- Name: roles_tenantId_name_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "roles_tenantId_name_key" ON public.roles USING btree ("tenantId", name);


--
-- Name: seo_meta_entityType_entityId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "seo_meta_entityType_entityId_key" ON public.seo_meta USING btree ("entityType", "entityId");


--
-- Name: sitemap_entries_url_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX sitemap_entries_url_key ON public.sitemap_entries USING btree (url);


--
-- Name: subscriptions_tenantId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON public.subscriptions USING btree ("tenantId");


--
-- Name: tasks_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "tasks_tenantId_idx" ON public.tasks USING btree ("tenantId");


--
-- Name: tenants_customDomain_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "tenants_customDomain_key" ON public.tenants USING btree ("customDomain");


--
-- Name: tenants_slug_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);


--
-- Name: testimonials_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "testimonials_tenantId_idx" ON public.testimonials USING btree ("tenantId");


--
-- Name: vendor_refresh_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "vendor_refresh_tokens_tokenHash_key" ON public.vendor_refresh_tokens USING btree ("tokenHash");


--
-- Name: vendor_refresh_tokens_vendorId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "vendor_refresh_tokens_vendorId_idx" ON public.vendor_refresh_tokens USING btree ("vendorId");


--
-- Name: vendors_tenantId_email_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "vendors_tenantId_email_key" ON public.vendors USING btree ("tenantId", email);


--
-- Name: vendors_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "vendors_tenantId_idx" ON public.vendors USING btree ("tenantId");


--
-- Name: visa_info_countryId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "visa_info_countryId_key" ON public.visa_info USING btree ("countryId");


--
-- Name: vouchers_bookingId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "vouchers_bookingId_key" ON public.vouchers USING btree ("bookingId");


--
-- Name: wishlist_items_customerId_packageId_key; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE UNIQUE INDEX "wishlist_items_customerId_packageId_key" ON public.wishlist_items USING btree ("customerId", "packageId");


--
-- Name: wishlist_items_tenantId_idx; Type: INDEX; Schema: public; Owner: paxbook
--

CREATE INDEX "wishlist_items_tenantId_idx" ON public.wishlist_items USING btree ("tenantId");


--
-- Name: admin_users admin_users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT "admin_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: admin_users admin_users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT "admin_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_actorAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: banners banners_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT "banners_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blog_posts blog_posts_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT "blog_posts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: booking_status_history booking_status_history_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: booking_status_history booking_status_history_changedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT "booking_status_history_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: booking_travelers booking_travelers_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_travelers
    ADD CONSTRAINT "booking_travelers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: booking_travelers booking_travelers_travelerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.booking_travelers
    ADD CONSTRAINT "booking_travelers_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES public.travelers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bookings bookings_consultantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bookings bookings_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bookings bookings_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bookings bookings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cancellation_requests cancellation_requests_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.cancellation_requests
    ADD CONSTRAINT "cancellation_requests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cancellation_requests cancellation_requests_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.cancellation_requests
    ADD CONSTRAINT "cancellation_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: consultants consultants_adminUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.consultants
    ADD CONSTRAINT "consultants_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: coupons coupons_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "coupons_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: coupons coupons_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "coupons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_documents customer_documents_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customer_documents
    ADD CONSTRAINT "customer_documents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_documents customer_documents_travelerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customer_documents
    ADD CONSTRAINT "customer_documents_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES public.travelers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_refresh_tokens customer_refresh_tokens_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customer_refresh_tokens
    ADD CONSTRAINT "customer_refresh_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers customers_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: destination_activities destination_activities_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_activities
    ADD CONSTRAINT "destination_activities_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_category_map destination_category_map_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_category_map
    ADD CONSTRAINT "destination_category_map_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.destination_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_category_map destination_category_map_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_category_map
    ADD CONSTRAINT "destination_category_map_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_highlights destination_highlights_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_highlights
    ADD CONSTRAINT "destination_highlights_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_hotel_suggestions destination_hotel_suggestions_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destination_hotel_suggestions
    ADD CONSTRAINT "destination_hotel_suggestions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destinations destinations_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT "destinations_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public.countries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: destinations destinations_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT "destinations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: emi_plans emi_plans_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.emi_plans
    ADD CONSTRAINT "emi_plans_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: faq_items faq_items_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.faq_items
    ADD CONSTRAINT "faq_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: homepage_blocks homepage_blocks_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.homepage_blocks
    ADD CONSTRAINT "homepage_blocks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: itinerary_days itinerary_days_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT "itinerary_days_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_follow_ups lead_follow_ups_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.lead_follow_ups
    ADD CONSTRAINT "lead_follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leads leads_assignedConsultantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_assignedConsultantId_fkey" FOREIGN KEY ("assignedConsultantId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: package_activities package_activities_activityVendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_activities
    ADD CONSTRAINT "package_activities_activityVendorId_fkey" FOREIGN KEY ("activityVendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: package_activities package_activities_itineraryDayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_activities
    ADD CONSTRAINT "package_activities_itineraryDayId_fkey" FOREIGN KEY ("itineraryDayId") REFERENCES public.itinerary_days(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: package_flights package_flights_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_flights
    ADD CONSTRAINT "package_flights_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: package_gallery_images package_gallery_images_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_gallery_images
    ADD CONSTRAINT "package_gallery_images_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: package_hotels package_hotels_hotelVendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_hotels
    ADD CONSTRAINT "package_hotels_hotelVendorId_fkey" FOREIGN KEY ("hotelVendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: package_hotels package_hotels_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_hotels
    ADD CONSTRAINT "package_hotels_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: package_pricing_tiers package_pricing_tiers_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_pricing_tiers
    ADD CONSTRAINT "package_pricing_tiers_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: package_route_map_points package_route_map_points_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.package_route_map_points
    ADD CONSTRAINT "package_route_map_points_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: packages packages_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT "packages_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: packages packages_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT "packages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pages pages_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "pages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_adminUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refund_requests refund_requests_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT "refund_requests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refund_requests refund_requests_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT "refund_requests_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seasonal_rates seasonal_rates_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.seasonal_rates
    ADD CONSTRAINT "seasonal_rates_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: testimonials testimonials_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT "testimonials_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: travelers travelers_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.travelers
    ADD CONSTRAINT "travelers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_contracts vendor_contracts_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_contracts
    ADD CONSTRAINT "vendor_contracts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_payments vendor_payments_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT "vendor_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendor_payments vendor_payments_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT "vendor_payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_refresh_tokens vendor_refresh_tokens_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendor_refresh_tokens
    ADD CONSTRAINT "vendor_refresh_tokens_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendors vendors_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: visa_info visa_info_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.visa_info
    ADD CONSTRAINT "visa_info_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public.countries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vouchers vouchers_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "vouchers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wishlist_items wishlist_items_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paxbook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

