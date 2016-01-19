--
-- PostgreSQL database dump
--

-- Dumped from database version 9.4.4
-- Dumped by pg_dump version 9.4.4
-- Started on 2016-01-19 18:37:25 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 194 (class 3079 OID 12808)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 3002 (class 0 OID 0)
-- Dependencies: 194
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 193 (class 1259 OID 65343)
-- Name: edge; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE edge (
    id integer NOT NULL,
    from_node_id integer,
    to_node_id integer,
    subreddit_id integer,
    weight integer
);


ALTER TABLE edge OWNER TO postgres;

--
-- TOC entry 192 (class 1259 OID 65341)
-- Name: edge_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE edge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE edge_id_seq OWNER TO postgres;

--
-- TOC entry 3003 (class 0 OID 0)
-- Dependencies: 192
-- Name: edge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE edge_id_seq OWNED BY edge.id;


--
-- TOC entry 191 (class 1259 OID 62789)
-- Name: node; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE node (
    id integer NOT NULL,
    state text[],
    subreddit_id integer
);


ALTER TABLE node OWNER TO postgres;

--
-- TOC entry 190 (class 1259 OID 62787)
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
-- TOC entry 3004 (class 0 OID 0)
-- Dependencies: 190
-- Name: node_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE node_id_seq OWNED BY node.id;


--
-- TOC entry 189 (class 1259 OID 62776)
-- Name: subreddit; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE subreddit (
    id integer NOT NULL,
    name text
);


ALTER TABLE subreddit OWNER TO postgres;

--
-- TOC entry 188 (class 1259 OID 62774)
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
-- TOC entry 3005 (class 0 OID 0)
-- Dependencies: 188
-- Name: subreddit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE subreddit_id_seq OWNED BY subreddit.id;


--
-- TOC entry 2864 (class 2604 OID 65346)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY edge ALTER COLUMN id SET DEFAULT nextval('edge_id_seq'::regclass);


--
-- TOC entry 2863 (class 2604 OID 62792)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY node ALTER COLUMN id SET DEFAULT nextval('node_id_seq'::regclass);


--
-- TOC entry 2862 (class 2604 OID 62779)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY subreddit ALTER COLUMN id SET DEFAULT nextval('subreddit_id_seq'::regclass);


--
-- TOC entry 2875 (class 2606 OID 65350)
-- Name: edge_from_node_id_to_node_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY edge
    ADD CONSTRAINT edge_from_node_id_to_node_id_key UNIQUE (from_node_id, to_node_id);


--
-- TOC entry 2877 (class 2606 OID 65348)
-- Name: edge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY edge
    ADD CONSTRAINT edge_pkey PRIMARY KEY (id);


--
-- TOC entry 2870 (class 2606 OID 62797)
-- Name: node_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 2866 (class 2606 OID 62786)
-- Name: subreddit_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY subreddit
    ADD CONSTRAINT subreddit_name_key UNIQUE (name);


--
-- TOC entry 2868 (class 2606 OID 62784)
-- Name: subreddit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY subreddit
    ADD CONSTRAINT subreddit_pkey PRIMARY KEY (id);


--
-- TOC entry 2878 (class 1259 OID 65366)
-- Name: idx_edge_from_node_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX idx_edge_from_node_id ON edge USING btree (from_node_id);


--
-- TOC entry 2879 (class 1259 OID 65368)
-- Name: idx_edge_subreddit_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX idx_edge_subreddit_id ON edge USING btree (subreddit_id);


--
-- TOC entry 2880 (class 1259 OID 65367)
-- Name: idx_edge_to_node_id; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX idx_edge_to_node_id ON edge USING btree (to_node_id);


--
-- TOC entry 2881 (class 1259 OID 65369)
-- Name: idx_edge_weight; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX idx_edge_weight ON edge USING btree (weight);


--
-- TOC entry 2871 (class 1259 OID 62803)
-- Name: node_state_1; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX node_state_1 ON node USING btree ((state[1]));


--
-- TOC entry 2872 (class 1259 OID 62804)
-- Name: node_state_2; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX node_state_2 ON node USING btree ((state[2]));


--
-- TOC entry 2873 (class 1259 OID 62805)
-- Name: node_subreddit; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX node_subreddit ON node USING btree (subreddit_id);


--
-- TOC entry 2883 (class 2606 OID 65351)
-- Name: edge_from_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY edge
    ADD CONSTRAINT edge_from_node_id_fkey FOREIGN KEY (from_node_id) REFERENCES node(id);


--
-- TOC entry 2885 (class 2606 OID 65361)
-- Name: edge_subreddit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY edge
    ADD CONSTRAINT edge_subreddit_id_fkey FOREIGN KEY (subreddit_id) REFERENCES subreddit(id);


--
-- TOC entry 2884 (class 2606 OID 65356)
-- Name: edge_to_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY edge
    ADD CONSTRAINT edge_to_node_id_fkey FOREIGN KEY (to_node_id) REFERENCES node(id);


--
-- TOC entry 2882 (class 2606 OID 62798)
-- Name: node_subreddit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY node
    ADD CONSTRAINT node_subreddit_id_fkey FOREIGN KEY (subreddit_id) REFERENCES subreddit(id);


--
-- TOC entry 3001 (class 0 OID 0)
-- Dependencies: 5
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2016-01-19 18:37:26 CET

--
-- PostgreSQL database dump complete
--

