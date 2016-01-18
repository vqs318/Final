--
-- PostgreSQL database dump
--

-- Dumped from database version 9.4.4
-- Dumped by pg_dump version 9.4.4
-- Started on 2016-01-18 03:15:51 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 2962 (class 1262 OID 52561)
-- Name: Reddit; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Reddit" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_AU.UTF-8' LC_CTYPE = 'en_AU.UTF-8';


ALTER DATABASE "Reddit" OWNER TO postgres;

\connect "Reddit"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 176 (class 3079 OID 12808)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2965 (class 0 OID 0)
-- Dependencies: 176
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 175 (class 1259 OID 60836)
-- Name: node; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE node (
    id integer NOT NULL,
    subreddit_id integer NOT NULL,
    state text[] NOT NULL,
    next text NOT NULL
);


ALTER TABLE node OWNER TO postgres;

--
-- TOC entry 174 (class 1259 OID 60834)
-- Name: node_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE node_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE node_id_seq OWNER TO postgres;

--
-- TOC entry 2966 (class 0 OID 0)
-- Dependencies: 174
-- Name: node_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE node_id_seq OWNED BY node.id;


--
-- TOC entry 173 (class 1259 OID 60755)
-- Name: subreddit; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE subreddit (
    id integer NOT NULL,
    name text
);


ALTER TABLE subreddit OWNER TO postgres;

--
-- TOC entry 172 (class 1259 OID 60753)
-- Name: subreddit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE subreddit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE subreddit_id_seq OWNER TO postgres;

--
-- TOC entry 2967 (class 0 OID 0)
-- Dependencies: 172
-- Name: subreddit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE subreddit_id_seq OWNED BY subreddit.id;


--
-- TOC entry 2841 (class 2604 OID 60839)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY node ALTER COLUMN id SET DEFAULT nextval('node_id_seq'::regclass);


--
-- TOC entry 2840 (class 2604 OID 60758)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY subreddit ALTER COLUMN id SET DEFAULT nextval('subreddit_id_seq'::regclass);


--
-- TOC entry 2847 (class 2606 OID 60844)
-- Name: node_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 2843 (class 2606 OID 60765)
-- Name: subreddit_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY subreddit
    ADD CONSTRAINT subreddit_name_key UNIQUE (name);


--
-- TOC entry 2845 (class 2606 OID 60763)
-- Name: subreddit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY subreddit
    ADD CONSTRAINT subreddit_pkey PRIMARY KEY (id);


--
-- TOC entry 2848 (class 2606 OID 60845)
-- Name: node_subreddit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY node
    ADD CONSTRAINT node_subreddit_id_fkey FOREIGN KEY (subreddit_id) REFERENCES subreddit(id);


--
-- TOC entry 2964 (class 0 OID 0)
-- Dependencies: 5
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2016-01-18 03:15:51 CET

--
-- PostgreSQL database dump complete
--

