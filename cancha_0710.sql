--
-- PostgreSQL database dump
--

\restrict iJNIUGxPpx4acMhfsAQJmXhaOw1LMSaxiXjyhYURv38WGQKWJT0KmfdcHiZzB3u

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2025-10-07 03:06:09

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
-- TOC entry 873 (class 1247 OID 58173)
-- Name: estado_cancha_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cancha_enum AS ENUM (
    'disponible',
    'ocupada',
    'mantenimiento'
);


ALTER TYPE public.estado_cancha_enum OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 58180)
-- Name: estado_control_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_control_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_control_enum OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 58186)
-- Name: estado_encargado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_encargado_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_encargado_enum OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 58192)
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
-- TOC entry 885 (class 1247 OID 58202)
-- Name: estado_qr_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_qr_enum AS ENUM (
    'activo',
    'expirado',
    'usado'
);


ALTER TYPE public.estado_qr_enum OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 58210)
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
-- TOC entry 891 (class 1247 OID 58220)
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
-- TOC entry 894 (class 1247 OID 58230)
-- Name: nivel_deportista_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_deportista_enum AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);


ALTER TYPE public.nivel_deportista_enum OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 58238)
-- Name: sexo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sexo_enum AS ENUM (
    'masculino',
    'femenino'
);


ALTER TYPE public.sexo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 58243)
-- Name: admin_esp_dep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_esp_dep (
    id_admin_esp_dep integer NOT NULL,
    fecha_ingreso date NOT NULL,
    direccion character varying(255),
    estado boolean DEFAULT true
);


ALTER TABLE public.admin_esp_dep OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 58247)
-- Name: administrador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrador (
    id_administrador integer NOT NULL,
    direccion text,
    estado boolean DEFAULT true,
    ultimo_login timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.administrador OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 58254)
-- Name: cancha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancha (
    id_cancha integer NOT NULL,
    nombre character varying(100) NOT NULL,
    capacidad integer,
    estado public.estado_cancha_enum,
    ubicacion character varying(255),
    monto_por_hora numeric(10,2),
    imagen_cancha text,
    id_espacio integer NOT NULL
);


ALTER TABLE public.cancha OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 58259)
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
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 218
-- Name: cancha_id_cancha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cancha_id_cancha_seq OWNED BY public.cancha.id_cancha;


--
-- TOC entry 219 (class 1259 OID 58260)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    fecha_nac date,
    carnet_identidad character varying(10),
    ci_complemento character varying(3)
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 58264)
-- Name: comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentario (
    id_comentario integer NOT NULL,
    contenido text,
    fecha_comentario date,
    hora_comentario time without time zone,
    id_cancha integer NOT NULL,
    id_cliente integer NOT NULL,
    estado boolean DEFAULT false
);


ALTER TABLE public.comentario OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 58270)
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
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 221
-- Name: comentario_id_comentario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentario_id_comentario_seq OWNED BY public.comentario.id_comentario;


--
-- TOC entry 222 (class 1259 OID 58271)
-- Name: control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.control (
    id_control integer NOT NULL,
    fecha_asignacion date,
    estado boolean DEFAULT true
);


ALTER TABLE public.control OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 58275)
-- Name: deportista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportista (
    id_deportista integer NOT NULL,
    nivel public.nivel_deportista_enum,
    disciplina_principal character varying(100)
);


ALTER TABLE public.deportista OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 58278)
-- Name: disciplina; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplina (
    id_disciplina integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text
);


ALTER TABLE public.disciplina OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 58283)
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
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 225
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disciplina_id_disciplina_seq OWNED BY public.disciplina.id_disciplina;


--
-- TOC entry 226 (class 1259 OID 58284)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    id_empresa integer NOT NULL,
    fecha_registrado timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    logo_imagen character varying(255),
    nombre_sistema character varying(100) NOT NULL,
    titulo_h1 character varying(150),
    descripcion_h1 text,
    te_ofrecemos text,
    imagen_1 character varying(255),
    imagen_2 character varying(255),
    imagen_3 character varying(255),
    titulo_1 character varying(150),
    titulo_2 character varying(150),
    titulo_3 character varying(150),
    descripcion_1 text,
    descripcion_2 text,
    descripcion_3 text,
    mision text,
    vision text,
    objetivo_1 text,
    objetivo_2 text,
    objetivo_3 text,
    quienes_somos text,
    correo_empresa character varying(150),
    telefono character varying(50),
    direccion text,
    id_administrador integer NOT NULL,
    nuestro_objetivo text,
    imagen_hero character varying(255)
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 58290)
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_id_empresa_seq OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 227
-- Name: empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;


--
-- TOC entry 228 (class 1259 OID 58291)
-- Name: encargado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.encargado (
    id_encargado integer NOT NULL,
    responsabilidad character varying(255),
    fecha_inicio date,
    hora_ingreso time without time zone,
    hora_salida time without time zone,
    estado boolean DEFAULT true
);


ALTER TABLE public.encargado OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 58295)
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
    id_admin_esp_dep integer NOT NULL,
    imagen_principal text,
    imagen_sec_1 text,
    imagen_sec_2 text,
    imagen_sec_3 text,
    imagen_sec_4 text
);


ALTER TABLE public.espacio_deportivo OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 58300)
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
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 230
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.espacio_deportivo_id_espacio_seq OWNED BY public.espacio_deportivo.id_espacio;


--
-- TOC entry 231 (class 1259 OID 58301)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    monto numeric(10,2),
    metodo_pago public.metodo_pago_enum,
    fecha_pago date,
    estado_pago public.estado_pago_enum,
    id_reserva integer NOT NULL
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 58304)
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
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- TOC entry 233 (class 1259 OID 58305)
-- Name: participa_en; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participa_en (
    id_deportista integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha_reserva date
);


ALTER TABLE public.participa_en OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 58308)
-- Name: persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona (
    id_persona integer NOT NULL,
    nombre character varying(100),
    apellido character varying(100),
    contrasena character varying(255) NOT NULL,
    telefono character varying(20),
    correo character varying(100) NOT NULL,
    sexo public.sexo_enum,
    imagen_perfil text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    usuario character varying(50) NOT NULL
);


ALTER TABLE public.persona OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 58313)
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
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 235
-- Name: persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.persona_id_persona_seq OWNED BY public.persona.id_persona;


--
-- TOC entry 236 (class 1259 OID 58314)
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
-- TOC entry 237 (class 1259 OID 58318)
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
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 237
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ponderacion_id_ponderacion_seq OWNED BY public.ponderacion.id_ponderacion;


--
-- TOC entry 238 (class 1259 OID 58319)
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
-- TOC entry 239 (class 1259 OID 58324)
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
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 239
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qr_reserva_id_qr_seq OWNED BY public.qr_reserva.id_qr;


--
-- TOC entry 240 (class 1259 OID 58325)
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
-- TOC entry 241 (class 1259 OID 58330)
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
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 241
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_incidencia_id_reporte_seq OWNED BY public.reporte_incidencia.id_reporte;


--
-- TOC entry 242 (class 1259 OID 58331)
-- Name: resena; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resena (
    id_resena integer NOT NULL,
    id_reserva integer NOT NULL,
    estrellas integer,
    comentario text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT false,
    CONSTRAINT resena_estrellas_check CHECK (((estrellas >= 1) AND (estrellas <= 5)))
);


ALTER TABLE public.resena OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 58339)
-- Name: resena_id_resena_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resena_id_resena_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resena_id_resena_seq OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 243
-- Name: resena_id_resena_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resena_id_resena_seq OWNED BY public.resena.id_resena;


--
-- TOC entry 244 (class 1259 OID 58340)
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
-- TOC entry 245 (class 1259 OID 58343)
-- Name: reserva_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva_horario (
    id_horario integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha date,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    monto numeric(10,2)
);


ALTER TABLE public.reserva_horario OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 58346)
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_horario_id_horario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_horario_id_horario_seq OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 246
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_horario_id_horario_seq OWNED BY public.reserva_horario.id_horario;


--
-- TOC entry 247 (class 1259 OID 58347)
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
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 247
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_id_reserva_seq OWNED BY public.reserva.id_reserva;


--
-- TOC entry 248 (class 1259 OID 58348)
-- Name: se_practica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.se_practica (
    id_cancha integer NOT NULL,
    id_disciplina integer NOT NULL,
    frecuencia_practica character varying(50)
);


ALTER TABLE public.se_practica OWNER TO postgres;

--
-- TOC entry 4810 (class 2604 OID 58351)
-- Name: cancha id_cancha; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha ALTER COLUMN id_cancha SET DEFAULT nextval('public.cancha_id_cancha_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 58352)
-- Name: comentario id_comentario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario ALTER COLUMN id_comentario SET DEFAULT nextval('public.comentario_id_comentario_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 58353)
-- Name: disciplina id_disciplina; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina ALTER COLUMN id_disciplina SET DEFAULT nextval('public.disciplina_id_disciplina_seq'::regclass);


--
-- TOC entry 4816 (class 2604 OID 58354)
-- Name: empresa id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);


--
-- TOC entry 4819 (class 2604 OID 58355)
-- Name: espacio_deportivo id_espacio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo ALTER COLUMN id_espacio SET DEFAULT nextval('public.espacio_deportivo_id_espacio_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 58356)
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 58357)
-- Name: persona id_persona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona ALTER COLUMN id_persona SET DEFAULT nextval('public.persona_id_persona_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 58358)
-- Name: ponderacion id_ponderacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion ALTER COLUMN id_ponderacion SET DEFAULT nextval('public.ponderacion_id_ponderacion_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 58359)
-- Name: qr_reserva id_qr; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva ALTER COLUMN id_qr SET DEFAULT nextval('public.qr_reserva_id_qr_seq'::regclass);


--
-- TOC entry 4824 (class 2604 OID 58360)
-- Name: reporte_incidencia id_reporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia ALTER COLUMN id_reporte SET DEFAULT nextval('public.reporte_incidencia_id_reporte_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 58361)
-- Name: resena id_resena; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena ALTER COLUMN id_resena SET DEFAULT nextval('public.resena_id_resena_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 58362)
-- Name: reserva id_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('public.reserva_id_reserva_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 58363)
-- Name: reserva_horario id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario ALTER COLUMN id_horario SET DEFAULT nextval('public.reserva_horario_id_horario_seq'::regclass);


--
-- TOC entry 5058 (class 0 OID 58243)
-- Dependencies: 215
-- Data for Name: admin_esp_dep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_esp_dep (id_admin_esp_dep, fecha_ingreso, direccion, estado) FROM stdin;
6	2025-09-28	Dirección 6	t
7	2025-09-28	Dirección 7	t
8	2025-09-28	Dirección 8	t
9	2025-09-28	Dirección 9	t
10	2025-09-28	Dirección 10	t
\.


--
-- TOC entry 5059 (class 0 OID 58247)
-- Dependencies: 216
-- Data for Name: administrador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrador (id_administrador, direccion, estado, ultimo_login, fecha_creacion) FROM stdin;
1	Av. Ballivián #123, La Paz	t	2025-09-27 12:41:10.098087	2025-09-28 12:41:10.098087
2	Calle Sucre #456, Cochabamba	t	2025-09-26 12:41:10.098087	2025-09-28 12:41:10.098087
3	Av. Beni #789, Santa Cruz	f	2025-09-23 12:41:10.098087	2025-09-28 12:41:10.098087
4	Zona Central #101, Oruro	t	2025-09-28 09:41:10.098087	2025-09-28 12:41:10.098087
5	Av. Potosí #202, Potosí	t	2025-09-28 12:31:10.098087	2025-09-28 12:41:10.098087
\.


--
-- TOC entry 5060 (class 0 OID 58254)
-- Dependencies: 217
-- Data for Name: cancha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cancha (id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio) FROM stdin;
1	la cancha del pueblo	99	disponible	Segundo Piso	200.00	/uploads/cancha/la_cancha_del_pueblo-2025-10-01-02_36_08-703.jpeg	1
3	Cancha Central	20	disponible	Av. Principal 123	50.00	/uploads/cancha/cancha_principal-2025-09-29-11_47_34-405.jpeg	2
4	Cancha Norte	15	ocupada	Calle Norte 456	40.00	/uploads/cancha/cancha_principal-2025-09-29-11_47_46-134.jpeg	1
2	Cancha Principal 22	20	mantenimiento	Calle Falsa 123	100.00	\N	1
5	Cancha Sur	25	disponible	Calle Sur 789	60.00	/uploads/cancha/cancha_sur-2025-10-01-06_52_12-377.jpeg	1
6	Cancha Principal 1	20	disponible	Calle Falsa 123	100.00	/uploads/cancha/cancha_principal-2025-09-29-11_48_10-510.jpeg	1
21	cancha xy	20	disponible	Calle Falsa 123	100.00	\N	1
\.


--
-- TOC entry 5062 (class 0 OID 58260)
-- Dependencies: 219
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento) FROM stdin;
11	2025-09-28	1990-05-12	12345678	LP
12	2025-09-28	1985-08-23	87654321	SC
13	2025-09-28	1992-11-03	23456789	CB
14	2025-09-28	2000-01-15	34567890	LP
15	2025-09-28	1995-07-30	45678901	OR
6	2025-10-01	2004-02-16	10921097	LP
\.


--
-- TOC entry 5063 (class 0 OID 58264)
-- Dependencies: 220
-- Data for Name: comentario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentario (id_comentario, contenido, fecha_comentario, hora_comentario, id_cancha, id_cliente, estado) FROM stdin;
\.


--
-- TOC entry 5065 (class 0 OID 58271)
-- Dependencies: 222
-- Data for Name: control; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.control (id_control, fecha_asignacion, estado) FROM stdin;
21	2025-09-28	t
22	2025-09-25	t
23	2025-09-20	f
24	2025-09-15	t
25	2025-09-10	f
\.


--
-- TOC entry 5066 (class 0 OID 58275)
-- Dependencies: 223
-- Data for Name: deportista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportista (id_deportista, nivel, disciplina_principal) FROM stdin;
16	avanzado	Fútbol
17	intermedio	Natación
18	principiante	Vóleibol
19	avanzado	Tenis
20	intermedio	Atletismo
\.


--
-- TOC entry 5067 (class 0 OID 58278)
-- Dependencies: 224
-- Data for Name: disciplina; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplina (id_disciplina, nombre, descripcion) FROM stdin;
1	Tenis	Tenis individual
3	Vóley	Vóley mixto en cancha de arena
2	Fútbol	Fútbol 11 y 7
\.


--
-- TOC entry 5069 (class 0 OID 58284)
-- Dependencies: 226
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (id_empresa, fecha_registrado, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, telefono, direccion, id_administrador, nuestro_objetivo, imagen_hero) FROM stdin;
2	2025-09-28 12:41:22.048553	/Uploads/empresa/lacanchita-2025-10-01-11_52_12-907.png	PlayPass	Un CLICK para reservar, Un QR para ingresar.	PlayPass te permite reservar canchas en segundos y acceder fácilmente con un código QR.	Una plataforma moderna que combina deporte y tecnología para simplificar tus reservas.	/Uploads/empresa/galletas-2025-10-02-07_55_10-607.png	/Uploads/empresa/lacanchita-2025-09-29-19_34_15-219.webp	/Uploads/empresa/lacanchita-2025-09-29-19_34_15-785.webp	Reservas en línea	Acceso con QR seguro	Gestión de horarios en tiempo real	Realiza tus reservas de canchas y espacios deportivos en segundos desde nuestro sitio web o tu teléfono móvil.	Accede a tus reservas de forma rápida y confiable mediante un código QR único, sin necesidad de comprobantes impresos.	Consulta la disponibilidad de canchas al instante y organiza tus reservas con una agenda siempre actualizada.	Facilitar el acceso a espacios deportivos mediante una plataforma tecnológica innovadora, que asegure reservas eficientes y un control de ingreso confiable con códigos QR, mejorando la administración y la experiencia de los usuarios.	Convertirnos en el sistema líder de reservas deportivas en Bolivia, reconocido por su seguridad, simplicidad y eficiencia, impulsando la modernización digital en la gestión de actividades deportivas.	Simplificar el proceso de reserva de espacios deportivos en web y móvil.	Garantizar seguridad y control de acceso con códigos QR validados en tiempo real.	Optimizar horarios y canchas evitando duplicaciones y sobreuso.	Somos un equipo apasionado por el deporte y la tecnología.	contact@company.com	(591) 777-77-777	La Paz, Monoblock UMSA #1234	1	Construimos una plataforma moderna, segura y eficiente para la reserva y gestión de espacios deportivos.	/Uploads/empresa/lacanchita-2025-10-01-19_34_15-219.webp
\.


--
-- TOC entry 5071 (class 0 OID 58291)
-- Dependencies: 228
-- Data for Name: encargado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.encargado (id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado) FROM stdin;
21	Administración	2025-01-10	08:00:00	16:00:00	t
22	Mantenimiento	2025-02-01	09:00:00	17:00:00	t
23	Logística	2025-03-15	07:30:00	15:30:00	t
24	Atención al cliente	2025-04-20	08:30:00	16:30:00	t
25	Seguridad	2025-05-05	06:00:00	14:00:00	t
26	Supervisión general	2025-09-01	08:00:00	16:00:00	t
27	Control de reservas	2025-09-05	09:00:00	17:00:00	t
28	Mantenimiento de canchas	2025-09-10	07:30:00	15:30:00	t
29	Atención al cliente	2025-09-12	10:00:00	18:00:00	t
30	Gestión de eventos	2025-09-15	08:30:00	16:30:00	t
\.


--
-- TOC entry 5072 (class 0 OID 58295)
-- Dependencies: 229
-- Data for Name: espacio_deportivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.espacio_deportivo (id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin_esp_dep, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4) FROM stdin;
9	Complejo Deportivo Cotahuma	Cotahuma, La Paz	Complejo municipal con canchas múltiples y pista de atletismo.	-16.520000	-68.140000	08:00:00	18:00:00	7	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-643.jpg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-631.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-250.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-983.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-328.jpeg
10	Coliseo Rafael Mendoza	Achumani, La Paz	Coliseo techado del Club The Strongest.	-16.495000	-68.095000	08:00:00	05:00:00	7	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-757.jpg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-714.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-579.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-616.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-748.jpeg
11	Coliseo Villa Esperanza	Villa Esperanza, El Alto	Espacio techado para futsal, básquet y vóley.	-16.495000	-68.177000	09:00:00	20:00:00	8	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-684.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-149.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-717.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-759.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-740.jpeg
12	Complejo Deportivo Mariscal Braun	Zona Miraflores, La Paz	Complejo de fútbol con tradición liguera paceña.	-16.506000	-68.125000	08:00:00	18:00:00	8	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-756.jpg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-427.jpg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-351.jpeg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-698.jpeg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-720.jpeg
13	Coliseo Chamoco Chico	Chamoco Chico, La Paz	Coliseo barrial con actividades deportivas y sociales.	-16.512000	-68.138000	08:00:00	17:00:00	8	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-542.jpg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-168.jpg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-748.jpeg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-786.jpeg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-485.jpeg
14	Coliseo Los Andes	Los Andes, El Alto	Coliseo municipal para eventos de futsal y artes marciales.	-16.497000	-68.181000	08:00:00	18:00:00	8	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-687.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-946.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-847.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-803.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-218.jpeg
2	Coliseo Cerrado Julio Borelli	Av. Saavedra, Miraflores, La Paz	Histórico coliseo cerrado para básquet, vóley y boxeo.	-16.500000	-68.150000	09:00:00	21:00:00	6	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-218.jpg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-189.jpg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-156.jpeg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-387.jpeg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-918.jpg
3	Coliseo Max Fernández	Ciudad Satélite, El Alto	Coliseo moderno en El Alto, multiuso para eventos deportivos.	-16.511000	-68.174000	08:30:00	20:30:00	6	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-386.webp	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-430.jpg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-919.jpg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-521.jpeg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-549.jpeg
4	Complejo de Achumani	Achumani, La Paz	Complejo de entrenamiento del Club The Strongest.	-16.499000	-68.119000	07:00:00	08:00:00	6	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-881.png	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-489.jpg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-235.jpeg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-272.jpeg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-310.jpeg
5	Centro Acuático de La Paz	Alto Obrajes, La Paz	Piscina olímpica moderna, sede de torneos nacionales.	-16.520000	-68.122000	08:00:00	21:00:00	6	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_28-517.webp	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_28-189.webp	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-353.jpeg	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-149.jpeg	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-339.jpeg
6	Polideportivo Héroes de Octubre	Av. Juan Pablo II, El Alto	Polideportivo de gran capacidad para eventos y torneos.	-16.504000	-68.165000	08:00:00	18:00:00	6	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-492.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-840.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-372.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-385.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-580.jpeg
7	Estadio de Villa Ingenio	Villa Ingenio, El Alto	Estadio del Club Always Ready, escenario paceño de primera división.	-16.479000	-68.163000	08:00:00	18:00:00	7	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-533.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-678.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-724.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-146.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-814.jpeg
8	Coliseo 12 de Octubre	12 de Octubre, El Alto	Coliseo de barrio con actividad comunitaria intensa.	-16.491000	-68.170000	09:00:00	18:00:00	6	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-566.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-948.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-698.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-592.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-545.jpg
15	Complejo Deportivo Municipal de Bajo San Antonio	Bajo San Antonio, La Paz	Complejo deportivo con canchas sintéticas y gimnasio.	-16.532000	-68.133000	09:00:00	18:00:00	10	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-515.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-840.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-109.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-151.jpg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-653.jpg
16	Estadio Hernando Siles 3	Av. Saavedra, Miraflores, La Paz	\N	-16.500000	-68.150000	\N	\N	10	\N	\N	\N	\N	\N
1	Estadio Hernando Siles 22	Zona Cementerio, Calle Esperanza #1233	Principal estadio paceño, sede de la selección boliviana.	-16.496483	-68.151125	08:00:00	22:00:00	6	/Uploads/espacio/estadio_hernando_siles_22-2025-10-07-21_44_41-855.jpg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-535.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-856.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-202.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-267.jpeg
\.


--
-- TOC entry 5074 (class 0 OID 58301)
-- Dependencies: 231
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, monto, metodo_pago, fecha_pago, estado_pago, id_reserva) FROM stdin;
3	50.00	tarjeta	2025-09-29	pendiente	1
4	60.00	transferencia	2025-09-28	exitoso	2
\.


--
-- TOC entry 5076 (class 0 OID 58305)
-- Dependencies: 233
-- Data for Name: participa_en; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participa_en (id_deportista, id_reserva, fecha_reserva) FROM stdin;
\.


--
-- TOC entry 5077 (class 0 OID 58308)
-- Dependencies: 234
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.persona (id_persona, nombre, apellido, contrasena, telefono, correo, sexo, imagen_perfil, latitud, longitud, usuario) FROM stdin;
5	María	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	maria@example.com	femenino	/Uploads/persona/1758976900793-480700748-5ba8f0664fac9942cd55cc17a4270029.jpg	-16.456789	-68.221234	maria5
8	anabel	Angus	$2b$10$h7NQizjsheLWAbmpBPtvWOeV.b7gXCuY0pcbyD8aHaQlMbAAagCo.	61234323	anabel@example.com	femenino	/Uploads/persona/1758927563599-149871330-fox_sleep.jpg	-16.589012	-68.167890	anabel8
9	Lucía	\N	$2b$10$eLjLB.0Fz8tKkw3xJks.Qe9WgWNsxkbus2wO5wijWqouFp/Xg/Nwi	\N	lucia9@example.com	\N	/Uploads/persona/1758986949406-532497048-23d53ce292754e0902447a133006b0eb.jpg	-16.431234	-68.212345	lucia9
2	Juan	\N	$2b$10$6eFEmrdP5DasGPP0ayouye4nheWhuNfj8UwJl3OPgbNsNHVf0Mx0i	\N	juan2@example.com	\N	/Uploads/persona/1758986883731-88446451-lego.png	-16.523876	-68.204321	juan2
3	juanita	Jalizco	$2b$10$MIUXuTpU1r31ducNT/kzFeFiOIcl3hapZ9xwV1Md5wNGitFRAMIbW	27122343	juanita@example.com	femenino	/Uploads/persona/1758925482071-745252188-image_3.jpg	-16.478912	-68.115678	juanita3
4	kevin	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	kevin@example.com	\N	/Uploads/persona/1758926001488-182654168-image_2.jpg	-16.542345	-68.178901	kevin4
10	Jenny	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	jenny@example.com	\N	/Uploads/persona/1758987013779-364663096-6f6b9f012c9b5efa9c6494e2bf2509bb.jpg	-16.574321	-68.123456	jenny10
12	Diego	\N	$2b$10$B.cJ2HuwERtJzgdRo4/LKuSgqio1QQwps0Sk0RK4Sx4lPdTEdk7j2	\N	diego@example.com	\N	/Uploads/persona/1758987628008-427296234-crazy.jpg	-16.562345	-68.154321	diego12
13	Santiago	\N	$2b$10$l.umZJDsRKmigTRcJ7MB..s5aQjqSv2rVnzd1TPWi0yLtu/oR8xWO	\N	santiago@example.com	\N	/Uploads/persona/1758987652779-703224593-chubaca.jpg	-16.486543	-68.201234	santiago13
15	Matías	\N	$2b$10$EIL5S3ohsUWNuijh6WicnePMX3L59Dv2IvWWwHm5PiB6RPIs7kz0S	\N	matias@example.com	\N	/Uploads/persona/1758987703313-291939961-mystery.jpg	-16.536789	-68.142345	matias15
11	Valeria	Mendoza	$2b$10$e76XkR1xW8NhgybGGMHeVeGTXeVprBNiFeUeEJE8Vj1.goXqdBDVe	\N	valeria@example.com	\N	/Uploads/persona/1758987612237-668172776-360_F_1024115848_VTfuHjHj9UVVvrUOaDQqm2clMspgRnGs.jpg	-16.498765	-68.187654	valeria11
32	Lilit	\N	$2b$10$ayvR.ZO3qR3v4CjQODr2u.mnvOIGwARasHOdMpmFptZ8BR18iKaYm	73812342	lilit@example.com	masculino	\N	-16.509617	-68.159848	lilit102
16	Camila	\N	$2b$10$enPBydtCvAO4OTysBizUBeodmHTdGWJFkiukVINZrYjFNmHIb8156	\N	camila@example.com	\N	/Uploads/persona/1758987728821-928409903-Pasted image.png	-16.521234	-68.193456	camila16
17	Bruno	\N	$2b$10$QbGF/81OWrlXJLfHiu2uLuxqRV1KtQmJrB7P2x3CHfkniHs.5R3vO	\N	bruno@example.com	\N	/Uploads/persona/1758987744640-82053267-incredible.jpg	-16.471234	-68.207890	bruno17
18	Natalia	\N	$2b$10$/eyWIAY5nTjTda.ghZadcuFv8Eoz8DxBwJ0aG4JQ1CqurH2BF5e2C	\N	natalia@example.com	\N	/Uploads/persona/1758987760648-977665783-Pasted image (4).png	-16.549876	-68.116543	natalia18
19	Emiliano	\N	$2b$10$AU8d9Vgv3fskb4uikU42ceH0l2nKGaW4tc84p1GyRmnl.H/iVsnyW	\N	emiliano@example.com	\N	/Uploads/persona/1758987787380-120472782-snoopy.jpg	-16.444321	-68.226789	emiliano19
20	Isabella	\N	$2b$10$94Dc34Ftmf.3X5kivaq/t.R4WEc7O.JfkEaQebSWqgKB6j02lzvGS	\N	isabella@example.com	\N	/Uploads/persona/1758987802392-606249869-Pasted image (5).png	-16.557890	-68.182345	isabella20
21	Joaquín	\N	$2b$10$aEWZCkf6P4vVCEgcYQpMl.aWYWDLHGyU.p30wHfeYbXTqPqajZYRy	\N	joaquin@example.com	\N	/Uploads/persona/1758987823985-359839422-mario.jpg	-16.465432	-68.135678	joaquin21
22	Paula	\N	$2b$10$T6xkjzCd4LlO5fhl5jhMEuljnxaee3W7P4dwm9RXYM0yas8xfrtz.	\N	paula@example.com	\N	/Uploads/persona/1758987844121-411179743-Pasted image (6).png	-16.580987	-68.198765	paula22
23	Andrés	\N	$2b$10$F7Ztp5UuEzrkDZjIlfBGDOYgSQRwtb.FsnKIEvy3sTR5iMQRIW.8.	\N	andres@example.com	\N	/Uploads/persona/1758987862517-629923651-batman.jpg	-16.439876	-68.210987	andres23
24	Mariana	\N	$2b$10$OD2fXx33AtXzPb6gv05OjO/R5jV2jUGZWKaKXBCJFqLvGYOT6hQza	\N	mariana@example.com	\N	/Uploads/persona/1758987897457-109270865-a18b2793fd68ddffcf7d2072dab33440.jpg	-16.514321	-68.125678	mariana24
25	Tomás	\N	$2b$10$2o4sUz4XXQDhZMOzA0sL2.YuPvv.w134zWKz60Qd.CiqewfytMlGm	\N	tomas@example.com	\N	/Uploads/persona/1758987916534-335570872-harry_potter.jpg	-16.487654	-68.173456	tomas25
27	lia@example.com	\N	$2b$10$Sm0K2Dc7X1Uftnyl2U.O0eqat/LGrdazxosGYjGyQd4am35STs4We	\N	lia22@example.com	\N	\N	-16.525106	-68.196994	lia26
14	Fernanda	\N	$2b$10$xF1KQtNvCALJZ9FoJM/SC.z6TXu5tpTC.xEbKk1eyYEPV.iuJ2nTm	\N	fernanda@example.com	\N	/Uploads/persona/1758987682780-108973594-175301007-businesswoman-cartoon-character-people-face-profiles-avatars-and-icons-close-up-image-of-smiling.jpg	-16.452198	-68.175678	fernanda14
26	Lía	Gutiérrez	$2b$10$abc123examplehash1	77511233	lia26@example.com	femenino	/Uploads/persona/lia26.jpg	-16.525106	-68.196994	lia00
28	Marco	Paredes	$2b$10$abc123examplehash2	77522344	marco28@example.com	masculino	/Uploads/persona/marco28.jpg	-16.532210	-68.187654	marco28
29	Camila	Torres	$2b$10$abc123examplehash3	77533455	camila29@example.com	femenino	/Uploads/persona/camila29.jpg	-16.518765	-68.172345	camila29
30	Diego	Salazar	$2b$10$abc123examplehash4	77544566	diego30@example.com	masculino	/Uploads/persona/diego30.jpg	-16.540987	-68.180123	diego30
31	ChiJung	\N	$2b$10$.hOX.3Ij.ne9KXoKIxArCOgvL4pCvJtC5Z.herN5LZvXkPy27focK	\N	jetin@example.com	\N	/Uploads/persona/ChiJung-2025-09-30_00-47-41.jpg	\N	\N	Jetinkiu
6	lucía	Flores	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	lucia@example.com	femenino	/Uploads/persona/1758976924369-313717056-woman-profile-mascot-illustration-female-avatar-character-icon-cartoon-girl-head-face-business-user-logo-free-vector.jpg	-16.513056	-68.192222	lucia6
7	pedro	\N	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	pedro@example.com	\N	/Uploads/persona/1758926093298-912862954-ancient.jpg	-16.500000	-68.150000	pedro7
1	Carlos Renan	VillaReal	$2b$10$vG2/OQvEeHeK1NfFLAeGbOSlAhGOgGqWu4lU6CUDeymapuGQNl0gG	63130742	carlos@example.com	masculino	/Uploads/persona/Carlos_Renan-2025-10-05_04-31-53.png	-16.513056	-68.192222	carlos1
\.


--
-- TOC entry 5079 (class 0 OID 58314)
-- Dependencies: 236
-- Data for Name: ponderacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ponderacion (id_ponderacion, calificacion, id_cliente, id_cancha) FROM stdin;
\.


--
-- TOC entry 5081 (class 0 OID 58319)
-- Dependencies: 238
-- Data for Name: qr_reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_reserva (id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control) FROM stdin;
1	2025-09-29 10:00:00	2025-10-01 10:00:00	/Uploads/qr/1_1759179821868.png	QR-UNICO-1	activo	1	21
\.


--
-- TOC entry 5083 (class 0 OID 58325)
-- Dependencies: 240
-- Data for Name: reporte_incidencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte_incidencia (id_reporte, detalle, sugerencia, id_encargado, id_reserva) FROM stdin;
1	Durante el partido se dañó una de las redes de la cancha.	Reemplazar la red antes del próximo encuentro.	26	1
\.


--
-- TOC entry 5085 (class 0 OID 58331)
-- Dependencies: 242
-- Data for Name: resena; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resena (id_resena, id_reserva, estrellas, comentario, fecha_creacion, estado) FROM stdin;
1	1	4	Excelente experiencia, la cancha estaba en buen estado.	2025-09-29 18:09:32.531593	t
\.


--
-- TOC entry 5087 (class 0 OID 58340)
-- Dependencies: 244
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva (id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha, id_disciplina) FROM stdin;
3	2025-10-01	8	300.00	100.00	en_cuotas	11	3	1
1	2025-10-02	6	250.00	50.00	pendiente	14	4	1
2	2025-10-04	4	150.00	75.00	en_cuotas	14	3	2
4	2025-10-05	8	400.00	0.00	cancelada	15	4	3
\.


--
-- TOC entry 5088 (class 0 OID 58343)
-- Dependencies: 245
-- Data for Name: reserva_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva_horario (id_horario, id_reserva, fecha, hora_inicio, hora_fin, monto) FROM stdin;
\.


--
-- TOC entry 5091 (class 0 OID 58348)
-- Dependencies: 248
-- Data for Name: se_practica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.se_practica (id_cancha, id_disciplina, frecuencia_practica) FROM stdin;
3	1	Diaria
3	2	Semanal
3	3	Mensual
4	1	Semanal
4	2	Mensual
4	3	Diaria
5	2	Diaria
5	1	\N
6	3	\N
21	1	\N
21	3	\N
\.


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 218
-- Name: cancha_id_cancha_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cancha_id_cancha_seq', 23, true);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 221
-- Name: comentario_id_comentario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentario_id_comentario_seq', 1, true);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 225
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disciplina_id_disciplina_seq', 3, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 227
-- Name: empresa_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_id_empresa_seq', 2, true);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 230
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.espacio_deportivo_id_espacio_seq', 16, true);


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 1, false);


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 235
-- Name: persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.persona_id_persona_seq', 38, true);


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 237
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ponderacion_id_ponderacion_seq', 1, true);


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 239
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qr_reserva_id_qr_seq', 1, true);


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 241
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_incidencia_id_reporte_seq', 1, true);


--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 243
-- Name: resena_id_resena_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resena_id_resena_seq', 1, true);


--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 246
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_horario_id_horario_seq', 1, false);


--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 247
-- Name: reserva_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_id_reserva_seq', 4, true);


--
-- TOC entry 4833 (class 2606 OID 58365)
-- Name: admin_esp_dep administrador_esp_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_esp_dep
    ADD CONSTRAINT administrador_esp_deportivo_pkey PRIMARY KEY (id_admin_esp_dep);


--
-- TOC entry 4835 (class 2606 OID 58367)
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (id_administrador);


--
-- TOC entry 4837 (class 2606 OID 58369)
-- Name: cancha cancha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT cancha_pkey PRIMARY KEY (id_cancha);


--
-- TOC entry 4839 (class 2606 OID 58371)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 4841 (class 2606 OID 58373)
-- Name: comentario comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (id_comentario);


--
-- TOC entry 4843 (class 2606 OID 58375)
-- Name: control control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT control_pkey PRIMARY KEY (id_control);


--
-- TOC entry 4845 (class 2606 OID 58377)
-- Name: deportista deportista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT deportista_pkey PRIMARY KEY (id_deportista);


--
-- TOC entry 4847 (class 2606 OID 58379)
-- Name: disciplina disciplina_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina
    ADD CONSTRAINT disciplina_pkey PRIMARY KEY (id_disciplina);


--
-- TOC entry 4849 (class 2606 OID 58381)
-- Name: empresa empresa_correo_empresa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_correo_empresa_key UNIQUE (correo_empresa);


--
-- TOC entry 4851 (class 2606 OID 58383)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- TOC entry 4853 (class 2606 OID 58385)
-- Name: encargado encargado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT encargado_pkey PRIMARY KEY (id_encargado);


--
-- TOC entry 4855 (class 2606 OID 58387)
-- Name: espacio_deportivo espacio_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT espacio_deportivo_pkey PRIMARY KEY (id_espacio);


--
-- TOC entry 4857 (class 2606 OID 58389)
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- TOC entry 4861 (class 2606 OID 58391)
-- Name: persona persona_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_correo_key UNIQUE (correo);


--
-- TOC entry 4863 (class 2606 OID 58393)
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- TOC entry 4865 (class 2606 OID 58395)
-- Name: persona persona_usuario_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_usuario_unique UNIQUE (usuario);


--
-- TOC entry 4859 (class 2606 OID 58397)
-- Name: participa_en pk_participa_en; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT pk_participa_en PRIMARY KEY (id_deportista, id_reserva);


--
-- TOC entry 4885 (class 2606 OID 58399)
-- Name: se_practica pk_se_practica; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT pk_se_practica PRIMARY KEY (id_cancha, id_disciplina);


--
-- TOC entry 4867 (class 2606 OID 58401)
-- Name: ponderacion ponderacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT ponderacion_pkey PRIMARY KEY (id_ponderacion);


--
-- TOC entry 4871 (class 2606 OID 58403)
-- Name: qr_reserva qr_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT qr_reserva_pkey PRIMARY KEY (id_qr);


--
-- TOC entry 4875 (class 2606 OID 58405)
-- Name: reporte_incidencia reporte_incidencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT reporte_incidencia_pkey PRIMARY KEY (id_reporte);


--
-- TOC entry 4877 (class 2606 OID 58407)
-- Name: resena resena_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT resena_pkey PRIMARY KEY (id_resena);


--
-- TOC entry 4883 (class 2606 OID 58409)
-- Name: reserva_horario reserva_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario
    ADD CONSTRAINT reserva_horario_pkey PRIMARY KEY (id_horario);


--
-- TOC entry 4881 (class 2606 OID 58411)
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- TOC entry 4887 (class 2606 OID 66263)
-- Name: se_practica unique_cancha_disciplina; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT unique_cancha_disciplina UNIQUE (id_cancha, id_disciplina);


--
-- TOC entry 4873 (class 2606 OID 58413)
-- Name: qr_reserva unq_qr_reserva; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT unq_qr_reserva UNIQUE (id_reserva);


--
-- TOC entry 4879 (class 2606 OID 58415)
-- Name: resena unq_resena_reserva; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT unq_resena_reserva UNIQUE (id_reserva);


--
-- TOC entry 4869 (class 2606 OID 58417)
-- Name: ponderacion uq_cliente_cancha; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT uq_cliente_cancha UNIQUE (id_cliente, id_cancha);


--
-- TOC entry 4896 (class 2606 OID 58418)
-- Name: empresa fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT fk_admin FOREIGN KEY (id_administrador) REFERENCES public.administrador(id_administrador) ON DELETE CASCADE;


--
-- TOC entry 4888 (class 2606 OID 58423)
-- Name: admin_esp_dep fk_admin_esp_dep_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_esp_dep
    ADD CONSTRAINT fk_admin_esp_dep_persona FOREIGN KEY (id_admin_esp_dep) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4889 (class 2606 OID 58428)
-- Name: administrador fk_administrador_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT fk_administrador_persona FOREIGN KEY (id_administrador) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4902 (class 2606 OID 58433)
-- Name: ponderacion fk_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4890 (class 2606 OID 58438)
-- Name: cancha fk_cancha_espacio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT fk_cancha_espacio FOREIGN KEY (id_espacio) REFERENCES public.espacio_deportivo(id_espacio) ON DELETE CASCADE;


--
-- TOC entry 4903 (class 2606 OID 58443)
-- Name: ponderacion fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4891 (class 2606 OID 58448)
-- Name: cliente fk_cliente_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_persona FOREIGN KEY (id_cliente) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4892 (class 2606 OID 58453)
-- Name: comentario fk_comentario_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 58458)
-- Name: comentario fk_comentario_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4894 (class 2606 OID 58463)
-- Name: control fk_control_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT fk_control_persona FOREIGN KEY (id_control) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4895 (class 2606 OID 58468)
-- Name: deportista fk_deportista_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT fk_deportista_persona FOREIGN KEY (id_deportista) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 58473)
-- Name: encargado fk_encargado_persona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT fk_encargado_persona FOREIGN KEY (id_encargado) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4898 (class 2606 OID 58478)
-- Name: espacio_deportivo fk_espacio_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT fk_espacio_admin FOREIGN KEY (id_admin_esp_dep) REFERENCES public.admin_esp_dep(id_admin_esp_dep) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 58483)
-- Name: pago fk_pago_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 58488)
-- Name: participa_en fk_participa_deportista; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_deportista FOREIGN KEY (id_deportista) REFERENCES public.deportista(id_deportista) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 58493)
-- Name: participa_en fk_participa_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 58498)
-- Name: qr_reserva fk_qr_reserva_control; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_control FOREIGN KEY (id_control) REFERENCES public.control(id_control) ON DELETE SET NULL;


--
-- TOC entry 4905 (class 2606 OID 58503)
-- Name: qr_reserva fk_qr_reserva_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 58508)
-- Name: reporte_incidencia fk_reporte_encargado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_encargado FOREIGN KEY (id_encargado) REFERENCES public.encargado(id_encargado) ON DELETE CASCADE;


--
-- TOC entry 4907 (class 2606 OID 58513)
-- Name: reporte_incidencia fk_reporte_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4908 (class 2606 OID 58518)
-- Name: resena fk_resena_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT fk_resena_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4909 (class 2606 OID 58523)
-- Name: reserva fk_reserva_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4910 (class 2606 OID 58528)
-- Name: reserva fk_reserva_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4911 (class 2606 OID 58533)
-- Name: reserva fk_reserva_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_disciplina FOREIGN KEY (id_disciplina) REFERENCES public.disciplina(id_disciplina) ON DELETE CASCADE;


--
-- TOC entry 4912 (class 2606 OID 58538)
-- Name: reserva_horario fk_reserva_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario
    ADD CONSTRAINT fk_reserva_horario FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4913 (class 2606 OID 58543)
-- Name: se_practica fk_se_practica_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 58548)
-- Name: se_practica fk_se_practica_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_disciplina FOREIGN KEY (id_disciplina) REFERENCES public.disciplina(id_disciplina) ON DELETE CASCADE;


-- Completed on 2025-10-07 03:06:10

--
-- PostgreSQL database dump complete
--

\unrestrict iJNIUGxPpx4acMhfsAQJmXhaOw1LMSaxiXjyhYURv38WGQKWJT0KmfdcHiZzB3u

