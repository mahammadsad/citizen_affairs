-- The public website is statically generated. Anonymous browser clients must not
-- receive direct table or sequence access to private editorial records.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
