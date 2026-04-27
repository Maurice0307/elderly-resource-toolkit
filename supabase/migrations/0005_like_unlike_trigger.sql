-- Decrement like_count when a like is removed
CREATE OR REPLACE FUNCTION decrement_resource_like_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE resources
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = OLD.resource_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER debump_resource_like_count
  AFTER DELETE ON resource_likes
  FOR EACH ROW EXECUTE FUNCTION decrement_resource_like_count();
