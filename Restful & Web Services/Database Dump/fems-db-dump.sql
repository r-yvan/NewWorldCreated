--
-- PostgreSQL database dump
--

\restrict qkeym5c0cP51xNdyhYvq2Xn83QyxKSTv1p1j1w0q0wS2rWnR57SRKIwuMk2V1Cc

-- Dumped from database version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: r-yvan
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "r-yvan";

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: r-yvan
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ExtinguisherSize; Type: TYPE; Schema: public; Owner: r-yvan
--

CREATE TYPE public."ExtinguisherSize" AS ENUM (
    '2_5_LBS',
    '5_LBS',
    '9_LBS',
    '12_LBS'
);


ALTER TYPE public."ExtinguisherSize" OWNER TO "r-yvan";

--
-- Name: ExtinguisherStatus; Type: TYPE; Schema: public; Owner: r-yvan
--

CREATE TYPE public."ExtinguisherStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'UNDER_MAINTENANCE',
    'INSPECTION_DUE',
    'OUT_OF_SERVICE'
);


ALTER TYPE public."ExtinguisherStatus" OWNER TO "r-yvan";

--
-- Name: ExtinguisherType; Type: TYPE; Schema: public; Owner: r-yvan
--

CREATE TYPE public."ExtinguisherType" AS ENUM (
    'WATER',
    'CO2',
    'FOAM',
    'DRY_CHEMICAL'
);


ALTER TYPE public."ExtinguisherType" OWNER TO "r-yvan";

--
-- Name: InspectionStatus; Type: TYPE; Schema: public; Owner: r-yvan
--

CREATE TYPE public."InspectionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."InspectionStatus" OWNER TO "r-yvan";

--
-- Name: Role; Type: TYPE; Schema: public; Owner: r-yvan
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'INSPECTOR',
    'USER'
);


ALTER TYPE public."Role" OWNER TO "r-yvan";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: r-yvan
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


ALTER TABLE public._prisma_migrations OWNER TO "r-yvan";

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    "userId" uuid,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO "r-yvan";

--
-- Name: extinguishers; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.extinguishers (
    id uuid NOT NULL,
    "serialNumber" text NOT NULL,
    location text NOT NULL,
    type public."ExtinguisherType" NOT NULL,
    size public."ExtinguisherSize" NOT NULL,
    "installationDate" timestamp(3) without time zone NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    status public."ExtinguisherStatus" DEFAULT 'ACTIVE'::public."ExtinguisherStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.extinguishers OWNER TO "r-yvan";

--
-- Name: inspections; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.inspections (
    id uuid NOT NULL,
    "extinguisherId" uuid NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "scheduledTime" text NOT NULL,
    "inspectorId" uuid,
    status public."InspectionStatus" DEFAULT 'PENDING'::public."InspectionStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inspections OWNER TO "r-yvan";

--
-- Name: maintenance; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.maintenance (
    id uuid NOT NULL,
    "extinguisherId" uuid NOT NULL,
    "inspectorId" uuid,
    "actionTaken" text NOT NULL,
    "conditionNotes" text NOT NULL,
    "maintenanceDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.maintenance OWNER TO "r-yvan";

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL,
    token text NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO "r-yvan";

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    token text NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO "r-yvan";

--
-- Name: users; Type: TABLE; Schema: public; Owner: r-yvan
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO "r-yvan";

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
db8c83da-8db5-434a-813b-3f3755f04ea8	09569dfed0b924e8e336342fd88ac28fdbab5a27fe66fcfb17d003aab43f6ab1	2026-06-03 13:29:47.489061+02	20260603112947_add_otp_and_email_verification	\N	\N	2026-06-03 13:29:47.475678+02	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.audit_logs (id, "userId", action, entity, "entityId", metadata, "createdAt") FROM stdin;
29782766-17d3-48c7-8115-216f62561b30	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGIN	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 11:46:47.522
a2f21b14-e2ad-4719-bf19-7e74220d16ab	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGOUT	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 11:46:51.777
46ac2077-b0e9-4f6e-a1b6-5ccece4e9798	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGIN	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-03 11:47:07.463
d96e76df-cf15-4adf-b9e6-fdb2ebfbb6f9	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGOUT	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-03 11:47:23.448
8681ba23-2a92-418d-b405-f156bc74f90b	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGIN	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 11:47:25.697
5e3f15eb-ed41-4a76-817f-f55ee91a2e29	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGOUT	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 11:47:45.578
3d378048-75d1-42cf-8fb0-3afa61246556	\N	USER_REGISTERED	User	60071ea0-80fb-418a-aaa7-7dc6f565e9a3	{"email": "admin@test.com"}	2026-06-03 11:48:17.068
58d0c98d-6afb-4c0e-af70-f9288a020ee8	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGIN	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 12:01:44.005
d5674f5a-4f1e-47d7-b53c-bca2c91c7ad0	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGOUT	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-03 12:01:49.504
f9840dce-c31b-4267-920a-1589a22ff627	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_REGISTERED	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	{"email": "admin@test.com"}	2026-06-03 12:02:31.719
1d9bbcb0-fe76-4848-9e34-bac32923f84c	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGOUT	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-03 12:02:38.199
1f389143-a0a2-499f-b952-c5bc50512159	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-03 12:02:53.882
6786441d-d23c-4654-8f06-7b7066e2fb15	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	INSPECTION_SCHEDULED	Inspection	3ab1bfc4-3550-44ec-bf0a-befb88f57fb3	{"extinguisherId": "6905a194-f81d-4cf3-b0ab-6ebe04e9440e"}	2026-06-03 12:03:25.827
07506105-68f3-4334-8768-ac774ab9109b	\N	USER_REGISTERED	User	5f3fc2c8-0aa2-4239-afa9-1dbc6255a881	{"email": "yvankiliye.rubuto@gmail.com"}	2026-06-04 08:04:10.592
e719b455-ba74-4494-a4db-5097874cf502	\N	USER_LOGOUT	User	5f3fc2c8-0aa2-4239-afa9-1dbc6255a881	\N	2026-06-04 08:06:24.74
0bb223db-3433-4d01-bf97-faf259e45ac8	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 08:10:06.919
84e09a6d-e254-4933-9af8-4ff82985fae5	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGIN	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-04 08:58:45.478
396c9a69-388f-4493-afc2-17e5a5a45057	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGOUT	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-04 09:01:34.136
6fcc7f23-7718-4757-bd25-5ee03b8252d5	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGIN	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-04 09:01:37.209
bfcdcafc-f33d-4675-ab74-7da87a23c589	c9531236-528a-43a5-920f-a203f58c6435	MAINTENANCE_CREATED	Maintenance	29f53d84-17d4-48aa-b686-8305a0d4bd6e	{"extinguisherId": "86ab4681-c18a-41b2-8537-a038dcead8da"}	2026-06-04 09:02:59.455
0bfb6e38-2540-420e-bcc4-79e6d6a34fa4	c9531236-528a-43a5-920f-a203f58c6435	MAINTENANCE_UPDATED	Maintenance	29f53d84-17d4-48aa-b686-8305a0d4bd6e	\N	2026-06-04 09:03:11.173
76ab3c01-073d-4671-bbda-258a26a1b2be	c9531236-528a-43a5-920f-a203f58c6435	REPORT_EXPORTED_PDF	Report	\N	{"fileName": "compliance-report-1780563802290.pdf"}	2026-06-04 09:03:22.326
bdd56e78-6b5a-4f28-a504-7a1e2b444e9a	c9531236-528a-43a5-920f-a203f58c6435	USER_LOGOUT	User	c9531236-528a-43a5-920f-a203f58c6435	\N	2026-06-04 09:04:05.081
aaeafc30-5889-4eab-a36d-08fb242d02e7	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 09:04:13.033
5e3a9434-d6ec-4022-a041-cda8faae2384	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	EXTINGUISHER_CREATED	Extinguisher	5e77b074-62e8-418f-b89c-0a6e394d6518	{"serialNumber": "FE-001"}	2026-06-04 09:05:14.358
6f187bb2-b274-45f2-a206-f7e36f3178be	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 09:18:41.093
275c0cd1-3583-4f21-a5ae-49cfc1cf9c39	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	EXTINGUISHER_CREATED	Extinguisher	22a522d9-13b2-4c0e-95a2-68a4c84747fe	{"serialNumber": "FE-004"}	2026-06-04 09:20:40.977
7bee0ecf-5348-4328-8643-7492c54fba58	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	EXTINGUISHER_UPDATED	Extinguisher	22a522d9-13b2-4c0e-95a2-68a4c84747fe	{"after": {"id": "22a522d9-13b2-4c0e-95a2-68a4c84747fe", "size": "SIZE_12_LBS", "type": "WATER", "status": "ACTIVE", "location": "Gikondo", "createdAt": "2026-06-04T09:20:40.975Z", "updatedAt": "2026-06-04T09:20:58.014Z", "expiryDate": "2026-12-12T00:00:00.000Z", "serialNumber": "FE-004", "installationDate": "2026-06-04T00:00:00.000Z"}, "before": {"id": "22a522d9-13b2-4c0e-95a2-68a4c84747fe", "size": "SIZE_12_LBS", "type": "DRY_CHEMICAL", "status": "ACTIVE", "location": "Gikondo", "createdAt": "2026-06-04T09:20:40.975Z", "updatedAt": "2026-06-04T09:20:40.975Z", "expiryDate": "2026-12-12T00:00:00.000Z", "serialNumber": "FE-004", "installationDate": "2026-06-04T00:00:00.000Z"}}	2026-06-04 09:20:58.019
68e1617c-c208-4a1b-9a1d-8ee763cc913e	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	EXTINGUISHER_DELETED	Extinguisher	5e77b074-62e8-418f-b89c-0a6e394d6518	{"serialNumber": "FE-001"}	2026-06-04 09:21:09.837
e33f60e5-303a-45f0-9aaa-b6a6b8f8cbc8	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGOUT	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 09:23:20.899
676d9dd0-d775-4e64-b5b1-081172805ac0	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 09:23:46.491
abdedb45-9ce3-40da-98aa-5de4bdd2f5fd	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	EXTINGUISHER_DELETED	Extinguisher	22a522d9-13b2-4c0e-95a2-68a4c84747fe	{"serialNumber": "FE-004"}	2026-06-04 09:24:16.229
2024a779-ccae-4021-bbca-f8b6cae5bab5	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGIN	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-04 09:25:31.324
e45d8767-0014-493e-afd2-c78ffcedc22a	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	INSPECTION_SCHEDULED	Inspection	d4cb51d7-a4de-419d-9402-1ca1835115bb	{"extinguisherId": "cd674744-6874-4944-8cbe-dd9aedd3bea8"}	2026-06-04 09:26:12.678
6ecf55e5-603a-495a-b978-bb363ac65946	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	USER_LOGOUT	User	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	\N	2026-06-04 09:26:38.61
1fea4fea-850b-424c-b2cd-e8bad4dad946	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	USER_LOGIN	User	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	\N	2026-06-04 09:26:51.748
afd18b84-c054-4b4d-aa59-2bebaf1993c5	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	INSPECTION_UPDATED	Inspection	9a40ae19-6022-430a-bf4b-dc4d0c46a3d2	{"status": "PENDING"}	2026-06-04 09:27:15.843
7c77219d-325e-452c-9181-88c522441837	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	REPORT_EXPORTED_PDF	Report	\N	{"fileName": "compliance-report-1780565256903.pdf"}	2026-06-04 09:27:36.927
\.


--
-- Data for Name: extinguishers; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.extinguishers (id, "serialNumber", location, type, size, "installationDate", "expiryDate", status, "createdAt", "updatedAt") FROM stdin;
86ab4681-c18a-41b2-8537-a038dcead8da	EXT-2024-001	Building A - Floor 1 - Room 101	CO2	5_LBS	2024-01-15 00:00:00	2026-01-15 00:00:00	ACTIVE	2026-06-03 11:32:32.221	2026-06-03 11:32:32.221
cd674744-6874-4944-8cbe-dd9aedd3bea8	EXT-2024-002	Building A - Floor 2 - Hallway	DRY_CHEMICAL	9_LBS	2024-02-20 00:00:00	2026-02-20 00:00:00	ACTIVE	2026-06-03 11:32:32.231	2026-06-03 11:32:32.231
6905a194-f81d-4cf3-b0ab-6ebe04e9440e	EXT-2023-015	Building B - Kitchen	FOAM	12_LBS	2023-06-10 00:00:00	2025-06-10 00:00:00	INSPECTION_DUE	2026-06-03 11:32:32.235	2026-06-03 11:32:32.235
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.inspections (id, "extinguisherId", "scheduledDate", "scheduledTime", "inspectorId", status, notes, "createdAt", "updatedAt") FROM stdin;
6dfeb012-c75f-41b3-bb9d-5513b52c39e0	cd674744-6874-4944-8cbe-dd9aedd3bea8	2026-05-20 00:00:00	14:30	c9531236-528a-43a5-920f-a203f58c6435	COMPLETED	Inspection passed. All seals intact.	2026-06-03 11:32:32.245	2026-06-03 11:32:32.245
3ab1bfc4-3550-44ec-bf0a-befb88f57fb3	6905a194-f81d-4cf3-b0ab-6ebe04e9440e	2026-06-07 00:00:00	09:00	\N	PENDING	rthsrthrth	2026-06-03 12:03:25.75	2026-06-03 12:03:25.75
d4cb51d7-a4de-419d-9402-1ca1835115bb	cd674744-6874-4944-8cbe-dd9aedd3bea8	2026-06-05 00:00:00	09:00	\N	PENDING	sdfvsdjasgfgh	2026-06-04 09:26:12.669	2026-06-04 09:26:12.669
9a40ae19-6022-430a-bf4b-dc4d0c46a3d2	86ab4681-c18a-41b2-8537-a038dcead8da	2026-06-15 00:00:00	10:00	c9531236-528a-43a5-920f-a203f58c6435	PENDING	Routine quarterly inspection	2026-06-03 11:32:32.241	2026-06-04 09:27:15.839
\.


--
-- Data for Name: maintenance; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.maintenance (id, "extinguisherId", "inspectorId", "actionTaken", "conditionNotes", "maintenanceDate", "createdAt", "updatedAt") FROM stdin;
63fa2b49-ffa0-4102-afe2-97d9faf20e61	cd674744-6874-4944-8cbe-dd9aedd3bea8	c9531236-528a-43a5-920f-a203f58c6435	Pressure check and seal replacement	Good condition, minor seal wear addressed	2026-05-20 00:00:00	2026-06-03 11:32:32.248	2026-06-03 11:32:32.248
29f53d84-17d4-48aa-b686-8305a0d4bd6e	86ab4681-c18a-41b2-8537-a038dcead8da	c9531236-528a-43a5-920f-a203f58c6435	Refilled extinguishing agent rhthrthsrtj	in good condition	2026-04-06 00:00:00	2026-06-04 09:02:59.448	2026-06-04 09:03:11.17
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.password_reset_tokens (id, token, "userId", "expiresAt", used, "createdAt") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", revoked, "createdAt") FROM stdin;
ea111197-6456-4745-9ef6-371527feb574	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNTY0NzIxLCJleHAiOjE3ODExNjk1MjF9.W0e87ckwGDzBvTJTNrLiu-MUWvH4bn1eflSq6TMnTTE	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-11 09:18:41.079	t	2026-06-04 09:18:41.081
2e06aa80-39b3-4202-acbc-3fdca613e7fa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOWFjM2EyZS1lM2YyLTRjMWMtYjI2OS05YjFkYjZjZDVhN2IiLCJlbWFpbCI6InVzZXJAdHp3LmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzgwNDg2OTM1LCJleHAiOjE3ODEwOTE3MzV9.n-lXTPg7D5BUGgdLP_teRtzOHbQIrdX3pRQBxid4WjA	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	2026-06-10 11:42:15.006	f	2026-06-03 11:42:15.007
53f00ee2-9bf0-487b-960d-5b767f00d835	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOTUzMTIzNi01MjhhLTQzYTUtOTIwZi1hMjAzZjU4YzY0MzUiLCJlbWFpbCI6Imluc3BlY3RvckB0encuY29tIiwicm9sZSI6IklOU1BFQ1RPUiIsImlhdCI6MTc4MDQ4NzIwNywiZXhwIjoxNzgxMDkyMDA3fQ.Jc1m9kRS6THr_36J_5y9KD2nyt610yKjMqJCMhrjiC8	c9531236-528a-43a5-920f-a203f58c6435	2026-06-10 11:46:47.51	t	2026-06-03 11:46:47.512
a881ed2f-b41b-4742-ab03-b4b60e04d9e2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOWFjM2EyZS1lM2YyLTRjMWMtYjI2OS05YjFkYjZjZDVhN2IiLCJlbWFpbCI6InVzZXJAdHp3LmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzgwNDg3MjI3LCJleHAiOjE3ODEwOTIwMjd9.m56y8XaXsTlJnk78twHNr9W2dcoFMjmkLIC4pOv5900	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	2026-06-10 11:47:07.417	t	2026-06-03 11:47:07.417
d8bfba92-4955-4b80-b679-1b2c60e4651c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOTUzMTIzNi01MjhhLTQzYTUtOTIwZi1hMjAzZjU4YzY0MzUiLCJlbWFpbCI6Imluc3BlY3RvckB0encuY29tIiwicm9sZSI6IklOU1BFQ1RPUiIsImlhdCI6MTc4MDQ4NzI0NSwiZXhwIjoxNzgxMDkyMDQ1fQ.0bKyOU6IHOgyOduvf2NZCv8SQpaEJ8qB66w-mkd1YdA	c9531236-528a-43a5-920f-a203f58c6435	2026-06-10 11:47:25.658	t	2026-06-03 11:47:25.659
2ea1c0d9-3d2f-4425-afac-bfd695368a73	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOTUzMTIzNi01MjhhLTQzYTUtOTIwZi1hMjAzZjU4YzY0MzUiLCJlbWFpbCI6Imluc3BlY3RvckB0encuY29tIiwicm9sZSI6IklOU1BFQ1RPUiIsImlhdCI6MTc4MDQ4ODEwNCwiZXhwIjoxNzgxMDkyOTA0fQ.wo9wmpe6JlXJDeiZFAENZEbiYecI0G_S5pUl0NIYCzI	c9531236-528a-43a5-920f-a203f58c6435	2026-06-10 12:01:44.001	t	2026-06-03 12:01:44.002
49231aad-fd28-46fa-b980-877330c32f7c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODA0ODgxNTEsImV4cCI6MTc4MTA5Mjk1MX0.rrNAJtwn6fV0DE2pcc8IsBiKvL6KTC1kjkLm-elcRRE	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-10 12:02:31.717	t	2026-06-03 12:02:31.718
032d5b68-ee2d-4d13-9894-fdd42b6a6b08	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODA0ODgxNzMsImV4cCI6MTc4MTA5Mjk3M30.avBtsFVh9RyoigqcUPBkdNiQKvtcPnk2Oi5OCtL7Xkg	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-10 12:02:53.818	f	2026-06-03 12:02:53.819
08e854e3-6dda-40ff-9a02-b309f4fe4cbc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNTY1MDI2LCJleHAiOjE3ODExNjk4MjZ9.ux86OP34a033qSYJdt3Rf9F0ZOPAqBxB1_wfQfnuiB0	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-11 09:23:46.486	f	2026-06-04 09:23:46.486
1756315a-d854-460f-8e05-f17d73cf1e23	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNTYwNjA2LCJleHAiOjE3ODExNjU0MDZ9.Dix9WaffdGX47BqiVQZ0QT-k7bp2frj7cLl1k1vJZI8	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-11 08:10:06.854	f	2026-06-04 08:10:06.855
bb93858b-1219-4469-b4e7-ebd38eebabc1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOWFjM2EyZS1lM2YyLTRjMWMtYjI2OS05YjFkYjZjZDVhN2IiLCJlbWFpbCI6InVzZXJAdHp3LmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzgwNTYzNTI1LCJleHAiOjE3ODExNjgzMjV9.YnBNnMAi97MYyUrI2PKRmoRBv-tpJJc-lveTUwX4Vx0	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	2026-06-11 08:58:45.449	t	2026-06-04 08:58:45.45
17c5af76-bf7d-45ae-8b7c-6c9f5222699c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOTUzMTIzNi01MjhhLTQzYTUtOTIwZi1hMjAzZjU4YzY0MzUiLCJlbWFpbCI6Imluc3BlY3RvckB0encuY29tIiwicm9sZSI6IklOU1BFQ1RPUiIsImlhdCI6MTc4MDU2MzY5NywiZXhwIjoxNzgxMTY4NDk3fQ.GT_0In-Z8tB9v431VEhfQjgkipb7tCzEJbNZ27dpVNw	c9531236-528a-43a5-920f-a203f58c6435	2026-06-11 09:01:37.175	t	2026-06-04 09:01:37.175
f902c643-c210-49dc-ba65-bdf5ecf2b072	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNTYzODUyLCJleHAiOjE3ODExNjg2NTJ9.z5sMdEmgubd77wmyUxsn5an0pi31o-ddI2U0Mwnn4hg	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-11 09:04:12.998	f	2026-06-04 09:04:12.998
6ac71262-1c4d-4d96-9774-905165c1ef69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkOWFjM2EyZS1lM2YyLTRjMWMtYjI2OS05YjFkYjZjZDVhN2IiLCJlbWFpbCI6InVzZXJAdHp3LmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzgwNTY1MTMxLCJleHAiOjE3ODExNjk5MzF9.tY8ezuCPQMhlVa89v5G_Z0FuY_uNBt1fXMxsi9QPoTo	d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	2026-06-11 09:25:31.318	t	2026-06-04 09:25:31.319
de9fb564-f0b1-442e-99a3-1c6de945538a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYjQ3MTZmOS1kYWQ5LTQxY2QtYjhiMC1jZjY5NzJkOGFhYWQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNTY1MjExLCJleHAiOjE3ODExNzAwMTF9.YXSq7eRPMUARSpaoEROyNURMWl2trFtOtBztwnHW9F8	bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	2026-06-11 09:26:51.739	f	2026-06-04 09:26:51.74
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: r-yvan
--

COPY public.users (id, "firstName", "lastName", email, "passwordHash", role, "isActive", "createdAt", "updatedAt") FROM stdin;
c9531236-528a-43a5-920f-a203f58c6435	Inspector	User	inspector@tzw.com	$2a$12$fUeN5Cv3BvJXwgtiEPLD1ew3rAKkTEqhMj2hSVCn2d3vdquQFi9HG	INSPECTOR	t	2026-06-03 11:32:31.889	2026-06-03 11:32:31.889
d9ac3a2e-e3f2-4c1c-b269-9b1db6cd5a7b	Regular	User	user@tzw.com	$2a$12$ADCr/o3SJEX4doCKh6FniebTrRXwaxmpZ1AWkfYuKDgg5LxNQvz4u	USER	t	2026-06-03 11:32:32.166	2026-06-03 11:32:32.166
bb4716f9-dad9-41cd-b8b0-cf6972d8aaad	Admin	System	admin@test.com	$2a$12$Uer2vSvMuMLq1dEIz2wHkOWZxrGaprON.Dn0zwPU10OHHK1inCQCu	ADMIN	t	2026-06-03 12:02:31.716	2026-06-03 12:02:31.716
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: extinguishers extinguishers_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.extinguishers
    ADD CONSTRAINT extinguishers_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_entity_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX audit_logs_entity_idx ON public.audit_logs USING btree (entity);


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: extinguishers_expiryDate_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "extinguishers_expiryDate_idx" ON public.extinguishers USING btree ("expiryDate");


--
-- Name: extinguishers_location_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX extinguishers_location_idx ON public.extinguishers USING btree (location);


--
-- Name: extinguishers_serialNumber_key; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE UNIQUE INDEX "extinguishers_serialNumber_key" ON public.extinguishers USING btree ("serialNumber");


--
-- Name: extinguishers_status_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX extinguishers_status_idx ON public.extinguishers USING btree (status);


--
-- Name: extinguishers_type_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX extinguishers_type_idx ON public.extinguishers USING btree (type);


--
-- Name: inspections_extinguisherId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "inspections_extinguisherId_idx" ON public.inspections USING btree ("extinguisherId");


--
-- Name: inspections_inspectorId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "inspections_inspectorId_idx" ON public.inspections USING btree ("inspectorId");


--
-- Name: inspections_scheduledDate_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "inspections_scheduledDate_idx" ON public.inspections USING btree ("scheduledDate");


--
-- Name: inspections_status_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX inspections_status_idx ON public.inspections USING btree (status);


--
-- Name: maintenance_extinguisherId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "maintenance_extinguisherId_idx" ON public.maintenance USING btree ("extinguisherId");


--
-- Name: maintenance_inspectorId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "maintenance_inspectorId_idx" ON public.maintenance USING btree ("inspectorId");


--
-- Name: maintenance_maintenanceDate_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "maintenance_maintenanceDate_idx" ON public.maintenance USING btree ("maintenanceDate");


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_userId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "password_reset_tokens_userId_idx" ON public.password_reset_tokens USING btree ("userId");


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: r-yvan
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inspections inspections_extinguisherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT "inspections_extinguisherId_fkey" FOREIGN KEY ("extinguisherId") REFERENCES public.extinguishers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inspections inspections_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT "inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance maintenance_extinguisherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT "maintenance_extinguisherId_fkey" FOREIGN KEY ("extinguisherId") REFERENCES public.extinguishers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance maintenance_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT "maintenance_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: r-yvan
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: r-yvan
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict qkeym5c0cP51xNdyhYvq2Xn83QyxKSTv1p1j1w0q0wS2rWnR57SRKIwuMk2V1Cc

