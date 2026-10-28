-- Protects the super admin row at the database level.
-- Applied idempotently by scripts/migrate.ts after drizzle migrations.

CREATE OR REPLACE FUNCTION protect_super_admin() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_super_admin THEN
      RAISE EXCEPTION 'super admin cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_super_admin THEN
      IF NEW.email_hash IS DISTINCT FROM OLD.email_hash
         OR NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin
         OR NEW.role IS DISTINCT FROM OLD.role
         OR NEW.suspended IS DISTINCT FROM OLD.suspended THEN
        RAISE EXCEPTION 'super admin identity, role and status are locked';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_protect_super_admin ON users;
CREATE TRIGGER users_protect_super_admin
  BEFORE UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_super_admin();

-- Keep role consistent with the flag for the super admin row.
CREATE OR REPLACE FUNCTION enforce_super_admin_role() RETURNS trigger AS $$
BEGIN
  IF NEW.is_super_admin AND NEW.role <> 'super_admin' THEN
    RAISE EXCEPTION 'super admin must have role super_admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_enforce_super_admin_role ON users;
CREATE TRIGGER users_enforce_super_admin_role
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION enforce_super_admin_role();
