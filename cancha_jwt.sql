--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estado_cancha_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cancha_enum AS ENUM (
    'disponible',
    'ocupada',
    'mantenimiento'
);


ALTER TYPE public.estado_cancha_enum OWNER TO postgres;

--
-- Name: estado_comentario_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_comentario_enum AS ENUM (
    'valido',
    'no_valido'
);


ALTER TYPE public.estado_comentario_enum OWNER TO postgres;

--
-- Name: estado_control_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_control_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_control_enum OWNER TO postgres;

--
-- Name: estado_encargado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_encargado_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_encargado_enum OWNER TO postgres;

--
-- Name: estado_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pago_enum AS ENUM (
    'pendiente',
    'exitoso',
    'fallido',
    'reembolsado'
);


ALTER TYPE public.estado_pago_enum OWNER TO postgres;

--
-- Name: estado_participacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_participacion_enum AS ENUM (
    'confirmado',
    'pendiente',
    'cancelado',
    'ausente'
);


ALTER TYPE public.estado_participacion_enum OWNER TO postgres;

--
-- Name: estado_qr_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_qr_enum AS ENUM (
    'activo',
    'expirado',
    'usado'
);


ALTER TYPE public.estado_qr_enum OWNER TO postgres;

--
-- Name: estado_reserva_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_reserva_enum AS ENUM (
    'pendiente',
    'pagada',
    'en_cuotas',
    'cancelada'
);


ALTER TYPE public.estado_reserva_enum OWNER TO postgres;

--
-- Name: metodo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_enum AS ENUM (
    'tarjeta',
    'efectivo',
    'transferencia',
    'QR'
);


ALTER TYPE public.metodo_pago_enum OWNER TO postgres;

--
-- Name: nivel_deportista_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_deportista_enum AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);


ALTER TYPE public.nivel_deportista_enum OWNER TO postgres;

--
-- Name: nivel_practica_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_practica_enum AS ENUM (
    'recreativo',
    'competitivo',
    'profesional'
);


ALTER TYPE public.nivel_practica_enum OWNER TO postgres;

--
-- Name: sexo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sexo_enum AS ENUM (
    'masculino',
    'femenino'
);


ALTER TYPE public.sexo_enum OWNER TO postgres;

--
-- Name: tipo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_pago_enum AS ENUM (
    'total',
    'cuota'
);


ALTER TYPE public.tipo_pago_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrador_esp_deportivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrador_esp_deportivo (
    id_admin integer NOT NULL,
    fecha_ingreso date NOT NULL,
    direccion character varying(255)
);


ALTER TABLE public.administrador_esp_deportivo OWNER TO postgres;

--
-- Name: cancha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancha (
    id_cancha integer NOT NULL,
    nombre character varying(100) NOT NULL,
    capacidad integer,
    estado public.estado_cancha_enum,
    ubicacion character varying(255),
    monto_por_hora numeric(10,2),
    imagen_principal text,
    imagen_sec_1 text,
    imagen_sec_2 text,
    imagen_sec_3 text,
    imagen_sec_4 text,
    id_espacio integer NOT NULL
);


ALTER TABLE public.cancha OWNER TO postgres;

--
-- Name: cancha_id_cancha_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cancha_id_cancha_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cancha_id_cancha_seq OWNER TO postgres;

--
-- Name: cancha_id_cancha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cancha_id_cancha_seq OWNED BY public.cancha.id_cancha;


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    fecha_nac date
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- Name: comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentario (
    id_comentario integer NOT NULL,
    contenido text,
    fecha_comentario date,
    hora_comentario time without time zone,
    estado public.estado_comentario_enum,
    id_cancha integer NOT NULL,
    id_cliente integer NOT NULL
);


ALTER TABLE public.comentario OWNER TO postgres;

--
-- Name: comentario_id_comentario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comentario_id_comentario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentario_id_comentario_seq OWNER TO postgres;

--
-- Name: comentario_id_comentario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentario_id_comentario_seq OWNED BY public.comentario.id_comentario;


--
-- Name: control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.control (
    id_control integer NOT NULL,
    fecha_asignacion date,
    estado public.estado_control_enum
);


ALTER TABLE public.control OWNER TO postgres;

--
-- Name: deportista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportista (
    id_deportista integer NOT NULL,
    nivel public.nivel_deportista_enum,
    disciplina_principal character varying(100)
);


ALTER TABLE public.deportista OWNER TO postgres;

--
-- Name: disciplina; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplina (
    id_disciplina integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text
);


ALTER TABLE public.disciplina OWNER TO postgres;

--
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disciplina_id_disciplina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.disciplina_id_disciplina_seq OWNER TO postgres;

--
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disciplina_id_disciplina_seq OWNED BY public.disciplina.id_disciplina;


--
-- Name: encargado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.encargado (
    id_encargado integer NOT NULL,
    responsabilidad character varying(255),
    fecha_inicio date,
    hora_ingreso time without time zone,
    hora_salida time without time zone,
    estado public.estado_encargado_enum NOT NULL
);


ALTER TABLE public.encargado OWNER TO postgres;

--
-- Name: espacio_deportivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.espacio_deportivo (
    id_espacio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    direccion character varying(255),
    descripcion text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    horario_apertura time without time zone,
    horario_cierre time without time zone,
    id_admin integer NOT NULL
);


ALTER TABLE public.espacio_deportivo OWNER TO postgres;

--
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.espacio_deportivo_id_espacio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.espacio_deportivo_id_espacio_seq OWNER TO postgres;

--
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.espacio_deportivo_id_espacio_seq OWNED BY public.espacio_deportivo.id_espacio;


--
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    tipo_pago public.tipo_pago_enum NOT NULL,
    monto numeric(10,2),
    metodo_pago public.metodo_pago_enum,
    fecha_pago date,
    estado_pago public.estado_pago_enum,
    id_reserva integer NOT NULL
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- Name: participa_en; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participa_en (
    id_deportista integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha_reserva date,
    estado_participacion public.estado_participacion_enum
);


ALTER TABLE public.participa_en OWNER TO postgres;

--
-- Name: persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona (
    id_persona integer NOT NULL,
    nombre character varying(100),
    apellido character varying(100),
    "contraseña" character varying(255) NOT NULL,
    telefono character varying(20),
    correo character varying(100) NOT NULL,
    sexo public.sexo_enum,
    imagen_perfil text,
    latitud numeric(9,6),
    longitud numeric(9,6)
);


ALTER TABLE public.persona OWNER TO postgres;

--
-- Name: persona_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.persona_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.persona_id_persona_seq OWNER TO postgres;

--
-- Name: persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.persona_id_persona_seq OWNED BY public.persona.id_persona;


--
-- Name: ponderacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ponderacion (
    id_ponderacion integer NOT NULL,
    calificacion integer NOT NULL,
    id_cliente integer NOT NULL,
    id_cancha integer NOT NULL,
    CONSTRAINT ponderacion_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


ALTER TABLE public.ponderacion OWNER TO postgres;

--
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ponderacion_id_ponderacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ponderacion_id_ponderacion_seq OWNER TO postgres;

--
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ponderacion_id_ponderacion_seq OWNED BY public.ponderacion.id_ponderacion;


--
-- Name: qr_reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_reserva (
    id_qr integer NOT NULL,
    fecha_generado timestamp without time zone NOT NULL,
    fecha_expira timestamp without time zone,
    qr_url_imagen text,
    codigo_qr character varying(255),
    estado public.estado_qr_enum,
    id_reserva integer NOT NULL,
    id_control integer
);


ALTER TABLE public.qr_reserva OWNER TO postgres;

--
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qr_reserva_id_qr_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_reserva_id_qr_seq OWNER TO postgres;

--
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qr_reserva_id_qr_seq OWNED BY public.qr_reserva.id_qr;


--
-- Name: reporte_incidencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reporte_incidencia (
    id_reporte integer NOT NULL,
    detalle text,
    sugerencia text,
    id_encargado integer NOT NULL,
    id_reserva integer NOT NULL
);


ALTER TABLE public.reporte_incidencia OWNER TO postgres;

--
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reporte_incidencia_id_reporte_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reporte_incidencia_id_reporte_seq OWNER TO postgres;

--
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_incidencia_id_reporte_seq OWNED BY public.reporte_incidencia.id_reporte;


--
-- Name: reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva (
    id_reserva integer NOT NULL,
    fecha_reserva date NOT NULL,
    cupo integer,
    monto_total numeric(10,2),
    saldo_pendiente numeric(10,2),
    estado public.estado_reserva_enum NOT NULL,
    id_cliente integer NOT NULL,
    id_cancha integer NOT NULL,
    id_disciplina integer NOT NULL
);


ALTER TABLE public.reserva OWNER TO postgres;

--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_id_reserva_seq OWNER TO postgres;

--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_id_reserva_seq OWNED BY public.reserva.id_reserva;


--
-- Name: se_practica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.se_practica (
    id_cancha integer NOT NULL,
    id_disciplina integer NOT NULL,
    frecuencia_practica character varying(50),
    nivel public.nivel_practica_enum
);


ALTER TABLE public.se_practica OWNER TO postgres;

--
-- Name: cancha id_cancha; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha ALTER COLUMN id_cancha SET DEFAULT nextval('public.cancha_id_cancha_seq'::regclass);


--
-- Name: comentario id_comentario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario ALTER COLUMN id_comentario SET DEFAULT nextval('public.comentario_id_comentario_seq'::regclass);


--
-- Name: disciplina id_disciplina; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina ALTER COLUMN id_disciplina SET DEFAULT nextval('public.disciplina_id_disciplina_seq'::regclass);


--
-- Name: espacio_deportivo id_espacio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo ALTER COLUMN id_espacio SET DEFAULT nextval('public.espacio_deportivo_id_espacio_seq'::regclass);


--
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- Name: persona id_persona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona ALTER COLUMN id_persona SET DEFAULT nextval('public.persona_id_persona_seq'::regclass);


--
-- Name: ponderacion id_ponderacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion ALTER COLUMN id_ponderacion SET DEFAULT nextval('public.ponderacion_id_ponderacion_seq'::regclass);


--
-- Name: qr_reserva id_qr; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva ALTER COLUMN id_qr SET DEFAULT nextval('public.qr_reserva_id_qr_seq'::regclass);


--
-- Name: reporte_incidencia id_reporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia ALTER COLUMN id_reporte SET DEFAULT nextval('public.reporte_incidencia_id_reporte_seq'::regclass);


--
-- Name: reserva id_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('public.reserva_id_reserva_seq'::regclass);


--
-- Data for Name: administrador_esp_deportivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrador_esp_deportivo (id_admin, fecha_ingreso, direccion) FROM stdin;
1	2025-09-17	Av. Siempre Viva 123
3	2025-09-10	Av. Siempre Revolucion
2	2025-01-15	Calle 20 de Octubre 456, El Alto
4	2025-02-20	Calle 16 de Julio 321, El Alto
5	2025-03-05	Av. Argentina 654, La Paz
\.


--
-- Data for Name: cancha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cancha (id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4, id_espacio) FROM stdin;
2	Cancha Norte 2	200	disponible	Calle 123, Zona Central	50.00	/uploads/cancha/1758152360665-195535131-una_cancha_deportiva_en_diferentes_angulos.jpeg	/uploads/cancha/1758152360710-187984708-una_cancha_deportiva_en_diferentes_angulos(1).jpeg	/uploads/cancha/1758152360776-928444497-una_cancha_deportiva_en_diferentes_angulos(2).jpeg	\N	\N	1
1	Cancha Norte	200	disponible	Calle 123, Zona Central	55.00	/uploads/cancha/1758152185551-724432434-0d4c4bf30031c70362ccf2618bc6e6e6.jpg	/uploads/cancha/1758152185557-19072268-830118dd69593b699dca9bd74adc8831.jpg	\N	\N	\N	1
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id_cliente, fecha_registro, fecha_nac) FROM stdin;
6	2025-01-10	1990-05-12
7	2025-02-15	1985-11-23
8	2025-03-05	1992-07-08
9	2025-04-20	2000-01-30
10	2025-05-01	1995-09-17
\.


--
-- Data for Name: comentario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentario (id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente) FROM stdin;
\.


--
-- Data for Name: control; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.control (id_control, fecha_asignacion, estado) FROM stdin;
16	2025-01-05	activo
17	2025-01-12	inactivo
18	2025-02-20	activo
19	2025-03-10	inactivo
20	2025-04-01	activo
\.


--
-- Data for Name: deportista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportista (id_deportista, nivel, disciplina_principal) FROM stdin;
11	avanzado	Natación
12	intermedio	Fútbol
13	principiante	Tenis
14	avanzado	Atletismo
15	intermedio	Voleibol
\.


--
-- Data for Name: disciplina; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplina (id_disciplina, nombre, descripcion) FROM stdin;
1	Tenis	Tenis individual
3	Vóley	Vóley mixto en cancha de arena
2	Fútbol	Fútbol 11 y 7
\.


--
-- Data for Name: encargado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.encargado (id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado) FROM stdin;
21	Administración	2025-01-10	08:00:00	16:00:00	activo
22	Mantenimiento	2025-02-01	09:00:00	17:00:00	activo
23	Logística	2025-03-15	07:30:00	15:30:00	inactivo
24	Atención al cliente	2025-04-20	08:30:00	16:30:00	activo
25	Seguridad	2025-05-05	06:00:00	14:00:00	activo
\.


--
-- Data for Name: espacio_deportivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.espacio_deportivo (id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin) FROM stdin;
1	Complejo Sur	Avenida Sur 456	Complejo con canchas de básquet	-16.541234	-68.145678	07:00:00	20:00:00	3
2	Polideportivo Norte	Calle Norte 123	Polideportivo con canchas de fútbol y vóley	-16.507890	-68.276543	08:00:00	22:00:00	1
3	Cancha Central	Plaza Principal S/N	Cancha techada multiusos	-16.478765	-68.195432	06:30:00	20:30:00	3
4	Cancha Sintética El Alto	Av. 16 de Julio, El Alto	Cancha de fútbol sintética con iluminación nocturna y vestuarios.	-16.562198	-68.132109	08:00:00	22:00:00	1
5	Cancha Sintética El Alto	Av. 16 de Julio, El Alto	Cancha de fútbol sintética con iluminación nocturna y vestuarios.	-16.449876	-68.239012	08:00:00	22:00:00	1
\.


--
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, tipo_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva) FROM stdin;
\.


--
-- Data for Name: participa_en; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participa_en (id_deportista, id_reserva, fecha_reserva, estado_participacion) FROM stdin;
\.


--
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.persona (id_persona, nombre, apellido, "contraseña", telefono, correo, sexo, imagen_perfil, latitud, longitud) FROM stdin;
1	Carlos Renan	VillaReal	$2b$10$RLrmAAmBX0aXPeIIkChUC.lZioHdHyjxCh8Rx7awJNswS5W/x4o7e	77546144	carlos@example.com	masculino	/Uploads/persona/1758138485456-306414796-6d505b7a38813cc4e1a987b0c073f2fe.jpg	-16.495123	-68.133456
2	Juan	\N	$2b$10$6eFEmrdP5DasGPP0ayouye4nheWhuNfj8UwJl3OPgbNsNHVf0Mx0i	\N	juan2@example.com	\N	/Uploads/persona/1758986883731-88446451-lego.png	-16.523876	-68.204321
3	juanita	Jalizco	$2b$10$MIUXuTpU1r31ducNT/kzFeFiOIcl3hapZ9xwV1Md5wNGitFRAMIbW	27122343	juanita@example.com	femenino	/Uploads/persona/1758925482071-745252188-image_3.jpg	-16.478912	-68.115678
4	kevin	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	kevin@example.com	\N	/Uploads/persona/1758926001488-182654168-image_2.jpg	-16.542345	-68.178901
11	Valeria	\N	$2b$10$e76XkR1xW8NhgybGGMHeVeGTXeVprBNiFeUeEJE8Vj1.goXqdBDVe	\N	valeria@example.com	\N	/Uploads/persona/1758987612237-668172776-360_F_1024115848_VTfuHjHj9UVVvrUOaDQqm2clMspgRnGs.jpg	-16.498765	-68.187654
5	María	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	maria@example.com	femenino	/Uploads/persona/1758976900793-480700748-5ba8f0664fac9942cd55cc17a4270029.jpg	-16.456789	-68.221234
6	lucía	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	lucia@example.com	femenino	/Uploads/persona/1758976924369-313717056-woman-profile-mascot-illustration-female-avatar-character-icon-cartoon-girl-head-face-business-user-logo-free-vector.jpg	-16.512345	-68.098765
7	pedro	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	pedro@example.com	\N	/Uploads/persona/1758926093298-912862954-ancient.jpg	-16.467890	-68.190123
8	anabel	Angus	$2b$10$h7NQizjsheLWAbmpBPtvWOeV.b7gXCuY0pcbyD8aHaQlMbAAagCo.	61234323	anabel@example.com	femenino	/Uploads/persona/1758927563599-149871330-fox_sleep.jpg	-16.589012	-68.167890
9	Lucía	\N	$2b$10$eLjLB.0Fz8tKkw3xJks.Qe9WgWNsxkbus2wO5wijWqouFp/Xg/Nwi	\N	lucia9@example.com	\N	/Uploads/persona/1758986949406-532497048-23d53ce292754e0902447a133006b0eb.jpg	-16.431234	-68.212345
10	Jenny	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	jenny@example.com	\N	/Uploads/persona/1758987013779-364663096-6f6b9f012c9b5efa9c6494e2bf2509bb.jpg	-16.574321	-68.123456
12	Diego	\N	$2b$10$B.cJ2HuwERtJzgdRo4/LKuSgqio1QQwps0Sk0RK4Sx4lPdTEdk7j2	\N	diego@example.com	\N	/Uploads/persona/1758987628008-427296234-crazy.jpg	-16.562345	-68.154321
13	Santiago	\N	$2b$10$l.umZJDsRKmigTRcJ7MB..s5aQjqSv2rVnzd1TPWi0yLtu/oR8xWO	\N	santiago@example.com	\N	/Uploads/persona/1758987652779-703224593-chubaca.jpg	-16.486543	-68.201234
15	Matías	\N	$2b$10$EIL5S3ohsUWNuijh6WicnePMX3L59Dv2IvWWwHm5PiB6RPIs7kz0S	\N	matias@example.com	\N	/Uploads/persona/1758987703313-291939961-mystery.jpg	-16.536789	-68.142345
14	Fernanda	\N	$2b$10$xF1KQtNvCALJZ9FoJM/SC.z6TXu5tpTC.xEbKk1eyYEPV.iuJ2nTm	\N	fernanda@example.com	\N	/Uploads/persona/1758987682780-108973594-175301007-businesswoman-cartoon-character-people-face-profiles-avatars-and-icons-close-up-image-of-smiling.jpg	-16.452198	-68.175678
16	Camila	\N	$2b$10$enPBydtCvAO4OTysBizUBeodmHTdGWJFkiukVINZrYjFNmHIb8156	\N	camila@example.com	\N	/Uploads/persona/1758987728821-928409903-Pasted image.png	-16.521234	-68.193456
17	Bruno	\N	$2b$10$QbGF/81OWrlXJLfHiu2uLuxqRV1KtQmJrB7P2x3CHfkniHs.5R3vO	\N	bruno@example.com	\N	/Uploads/persona/1758987744640-82053267-incredible.jpg	-16.471234	-68.207890
18	Natalia	\N	$2b$10$/eyWIAY5nTjTda.ghZadcuFv8Eoz8DxBwJ0aG4JQ1CqurH2BF5e2C	\N	natalia@example.com	\N	/Uploads/persona/1758987760648-977665783-Pasted image (4).png	-16.549876	-68.116543
19	Emiliano	\N	$2b$10$AU8d9Vgv3fskb4uikU42ceH0l2nKGaW4tc84p1GyRmnl.H/iVsnyW	\N	emiliano@example.com	\N	/Uploads/persona/1758987787380-120472782-snoopy.jpg	-16.444321	-68.226789
20	Isabella	\N	$2b$10$94Dc34Ftmf.3X5kivaq/t.R4WEc7O.JfkEaQebSWqgKB6j02lzvGS	\N	isabella@example.com	\N	/Uploads/persona/1758987802392-606249869-Pasted image (5).png	-16.557890	-68.182345
21	Joaquín	\N	$2b$10$aEWZCkf6P4vVCEgcYQpMl.aWYWDLHGyU.p30wHfeYbXTqPqajZYRy	\N	joaquin@example.com	\N	/Uploads/persona/1758987823985-359839422-mario.jpg	-16.465432	-68.135678
22	Paula	\N	$2b$10$T6xkjzCd4LlO5fhl5jhMEuljnxaee3W7P4dwm9RXYM0yas8xfrtz.	\N	paula@example.com	\N	/Uploads/persona/1758987844121-411179743-Pasted image (6).png	-16.580987	-68.198765
23	Andrés	\N	$2b$10$F7Ztp5UuEzrkDZjIlfBGDOYgSQRwtb.FsnKIEvy3sTR5iMQRIW.8.	\N	andres@example.com	\N	/Uploads/persona/1758987862517-629923651-batman.jpg	-16.439876	-68.210987
24	Mariana	\N	$2b$10$OD2fXx33AtXzPb6gv05OjO/R5jV2jUGZWKaKXBCJFqLvGYOT6hQza	\N	mariana@example.com	\N	/Uploads/persona/1758987897457-109270865-a18b2793fd68ddffcf7d2072dab33440.jpg	-16.514321	-68.125678
25	Tomás	\N	$2b$10$2o4sUz4XXQDhZMOzA0sL2.YuPvv.w134zWKz60Qd.CiqewfytMlGm	\N	tomas@example.com	\N	/Uploads/persona/1758987916534-335570872-harry_potter.jpg	-16.487654	-68.173456
27	lia@example.com	\N	$2b$10$Sm0K2Dc7X1Uftnyl2U.O0eqat/LGrdazxosGYjGyQd4am35STs4We	\N	lia22@example.com	\N	\N	-16.525106	-68.196994
\.


--
-- Data for Name: ponderacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ponderacion (id_ponderacion, calificacion, id_cliente, id_cancha) FROM stdin;
\.


--
-- Data for Name: qr_reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_reserva (id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control) FROM stdin;
\.


--
-- Data for Name: reporte_incidencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte_incidencia (id_reporte, detalle, sugerencia, id_encargado, id_reserva) FROM stdin;
\.


--
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva (id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina) FROM stdin;
\.


--
-- Data for Name: se_practica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.se_practica (id_cancha, id_disciplina, frecuencia_practica, nivel) FROM stdin;
2	1	Diaria	competitivo
1	2	Mensual	recreativo
\.


--
-- Name: cancha_id_cancha_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cancha_id_cancha_seq', 2, true);


--
-- Name: comentario_id_comentario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentario_id_comentario_seq', 1, true);


--
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disciplina_id_disciplina_seq', 3, true);


--
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.espacio_deportivo_id_espacio_seq', 5, true);


--
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 2, true);


--
-- Name: persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.persona_id_persona_seq', 27, true);


--
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ponderacion_id_ponderacion_seq', 1, true);


--
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qr_reserva_id_qr_seq', 2, true);


--
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_incidencia_id_reporte_seq', 2, true);


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_id_reserva_seq', 2, true);


--
-- Name: administrador_esp_deportivo administrador_esp_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador_esp_deportivo
    ADD CONSTRAINT administrador_esp_deportivo_pkey PRIMARY KEY (id_admin);


--
-- Name: cancha cancha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT cancha_pkey PRIMARY KEY (id_cancha);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- Name: comentario comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (id_comentario);


--
-- Name: control control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT control_pkey PRIMARY KEY (id_control);


--
-- Name: deportista deportista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT deportista_pkey PRIMARY KEY (id_deportista);


--
-- Name: disciplina disciplina_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina
    ADD CONSTRAINT disciplina_pkey PRIMARY KEY (id_disciplina);


--
-- Name: encargado encargado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT encargado_pkey PRIMARY KEY (id_encargado);


--
-- Name: espacio_deportivo espacio_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT espacio_deportivo_pkey PRIMARY KEY (id_espacio);


--
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- Name: persona persona_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_correo_key UNIQUE (correo);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- Name: participa_en pk_participa_en; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT pk_participa_en PRIMARY KEY (id_deportista, id_reserva);


--
-- Name: se_practica pk_se_practica; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT pk_se_practica PRIMARY KEY (id_cancha, id_disciplina);


--
-- Name: ponderacion ponderacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT ponderacion_pkey PRIMARY KEY (id_ponderacion);


--
-- Name: qr_reserva qr_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT qr_reserva_pkey PRIMARY KEY (id_qr);


--
-- Name: reporte_incidencia reporte_incidencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT reporte_incidencia_pkey PRIMARY KEY (id_reporte);


--
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- Name: ponderacion uq_cliente_cancha; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT uq_cliente_cancha UNIQUE (id_cliente, id_cancha);


--
-- Name: administrador_esp_deportivo fk_admin_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador_esp_deportivo
    ADD CONSTRAINT fk_admin_persona FOREIGN KEY (id_admin) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: ponderacion fk_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- Name: cancha fk_cancha_espacio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT fk_cancha_espacio FOREIGN KEY (id_espacio) REFERENCES public.espacio_deportivo(id_espacio) ON DELETE CASCADE;


--
-- Name: ponderacion fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- Name: cliente fk_cliente_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_persona FOREIGN KEY (id_cliente) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: comentario fk_comentario_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- Name: comentario fk_comentario_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- Name: control fk_control_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT fk_control_persona FOREIGN KEY (id_control) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: deportista fk_deportista_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT fk_deportista_persona FOREIGN KEY (id_deportista) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: encargado fk_encargado_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT fk_encargado_persona FOREIGN KEY (id_encargado) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: espacio_deportivo fk_espacio_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT fk_espacio_admin FOREIGN KEY (id_admin) REFERENCES public.administrador_esp_deportivo(id_admin) ON DELETE CASCADE;


--
-- Name: pago fk_pago_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: participa_en fk_participa_deportista; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_deportista FOREIGN KEY (id_deportista) REFERENCES public.deportista(id_deportista) ON DELETE CASCADE;


--
-- Name: participa_en fk_participa_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: qr_reserva fk_qr_reserva_control; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_control FOREIGN KEY (id_control) REFERENCES public.control(id_control) ON DELETE SET NULL;


--
-- Name: qr_reserva fk_qr_reserva_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reporte_incidencia fk_reporte_encargado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_encargado FOREIGN KEY (id_encargado) REFERENCES public.encargado(id_encargado) ON DELETE CASCADE;


--
-- Name: reporte_incidencia fk_reporte_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- Name: reserva fk_reserva_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- Name: reserva fk_reserva_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- Name: reserva fk_reserva_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_disciplina FOREIGN KEY (id_disciplina) REFERENCES public.disciplina(id_disciplina) ON DELETE CASCADE;


--
-- Name: se_practica fk_se_practica_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- Name: se_practica fk_se_practica_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_disciplina FOREIGN KEY (id_disciplina) REFERENCES public.disciplina(id_disciplina) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

