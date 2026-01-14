BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "equipment" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"type"	TEXT NOT NULL,
	"serialNumber"	TEXT NOT NULL UNIQUE,
	"assignedTo"	INTEGER,
	"maintenance"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS "ticket_attachments" (
	"id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"comment_id"	INTEGER,
	"user_id"	INTEGER NOT NULL,
	"filename"	TEXT NOT NULL,
	"filepath"	TEXT NOT NULL,
	"file_type"	TEXT,
	"file_size"	INTEGER,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("comment_id") REFERENCES "ticket_comments"("id") ON DELETE CASCADE,
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "ticket_comments" (
	"id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"comment_type"	TEXT DEFAULT 'comment' CHECK("comment_type" IN ('comment', 'task', 'internal_note', 'solution')),
	"message"	TEXT NOT NULL,
	"is_internal"	BOOLEAN DEFAULT 0,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "ticket_equipment" (
	"id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"equipment_id"	INTEGER NOT NULL,
	"added_by"	INTEGER NOT NULL,
	"notes"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("added_by") REFERENCES "users"("id") ON DELETE CASCADE,
	FOREIGN KEY("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE,
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "ticket_history" (
	"id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"action"	TEXT NOT NULL,
	"field_changed"	TEXT,
	"old_value"	TEXT,
	"new_value"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "ticket_time_logs" (
	"id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"time_spent"	INTEGER NOT NULL,
	"description"	TEXT,
	"log_date"	DATE DEFAULT (DATE('now')),
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "tickets" (
	"id"	INTEGER,
	"title"	TEXT NOT NULL,
	"description"	TEXT NOT NULL,
	"status"	TEXT DEFAULT 'open' CHECK("status" IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
	"priority"	TEXT DEFAULT 'medium' CHECK("priority" IN ('low', 'medium', 'high', 'urgent')),
	"category"	TEXT,
	"user_id"	INTEGER NOT NULL,
	"assigned_to"	INTEGER,
	"primary_equipment_id"	INTEGER,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"resolved_at"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL,
	FOREIGN KEY("primary_equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL,
	FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"role"	TEXT DEFAULT 'user' CHECK("role" IN ('admin', 'user')),
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "equipment" VALUES (1,'Dell Laptop 15','Laptop','SN123456789',1,'2025-06-30','2026-01-12 18:15:48','2026-01-12 18:16:39');
INSERT INTO "users" VALUES (1,'admin','$2a$10$S6Xdwwmjh4ydYkMUHZl/ie3dTTh4ZR/JxEosILOa0dAC2xgu8On/u','admin@helpdesk.local','admin','2026-01-12 11:33:56','2026-01-12 11:33:56');
INSERT INTO "users" VALUES (2,'Martim Silva','$2a$10$5rE14yUwQH25GDqbopaUDuZ6vcoNplwdZk2z.89rK0o8AEeu13QBm','david.moura@gmail.com','user','2026-01-12 22:02:59','2026-01-12 22:02:59');
CREATE INDEX IF NOT EXISTS "idx_attachments_comment_id" ON "ticket_attachments" (
	"comment_id"
);
CREATE INDEX IF NOT EXISTS "idx_attachments_created" ON "ticket_attachments" (
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_attachments_ticket_id" ON "ticket_attachments" (
	"ticket_id"
);
CREATE INDEX IF NOT EXISTS "idx_attachments_user_id" ON "ticket_attachments" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "idx_comments_created" ON "ticket_comments" (
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_comments_ticket_created" ON "ticket_comments" (
	"ticket_id",
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_comments_ticket_id" ON "ticket_comments" (
	"ticket_id"
);
CREATE INDEX IF NOT EXISTS "idx_comments_type" ON "ticket_comments" (
	"comment_type"
);
CREATE INDEX IF NOT EXISTS "idx_comments_user_id" ON "ticket_comments" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "idx_equipment_assignedTo" ON "equipment" (
	"assignedTo"
);
CREATE INDEX IF NOT EXISTS "idx_equipment_serialNumber" ON "equipment" (
	"serialNumber"
);
CREATE INDEX IF NOT EXISTS "idx_equipment_type" ON "equipment" (
	"type"
);
CREATE INDEX IF NOT EXISTS "idx_history_action" ON "ticket_history" (
	"action"
);
CREATE INDEX IF NOT EXISTS "idx_history_created" ON "ticket_history" (
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_history_ticket_id" ON "ticket_history" (
	"ticket_id"
);
CREATE INDEX IF NOT EXISTS "idx_history_user_id" ON "ticket_history" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "idx_ticket_equip_added_by" ON "ticket_equipment" (
	"added_by"
);
CREATE INDEX IF NOT EXISTS "idx_ticket_equip_equipment_id" ON "ticket_equipment" (
	"equipment_id"
);
CREATE INDEX IF NOT EXISTS "idx_ticket_equip_ticket_id" ON "ticket_equipment" (
	"ticket_id"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_status" ON "tickets" (
	"assigned_to",
	"status",
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_to" ON "tickets" (
	"assigned_to"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_category" ON "tickets" (
	"category"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at" ON "tickets" (
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_tickets_primary_equipment" ON "tickets" (
	"primary_equipment_id"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets" (
	"priority"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_resolved_at" ON "tickets" (
	"resolved_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets" (
	"status"
);
CREATE INDEX IF NOT EXISTS "idx_tickets_status_created" ON "tickets" (
	"status",
	"created_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_tickets_updated_at" ON "tickets" (
	"updated_at"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_tickets_user_id" ON "tickets" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "idx_time_logs_date" ON "ticket_time_logs" (
	"log_date"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_time_logs_ticket_date" ON "ticket_time_logs" (
	"ticket_id",
	"log_date"	DESC
);
CREATE INDEX IF NOT EXISTS "idx_time_logs_ticket_id" ON "ticket_time_logs" (
	"ticket_id"
);
CREATE INDEX IF NOT EXISTS "idx_time_logs_user_id" ON "ticket_time_logs" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" (
	"email"
);
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" (
	"role"
);
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" (
	"username"
);
CREATE TRIGGER trigger_auto_resolved_at
AFTER UPDATE OF status ON tickets
FOR EACH ROW
WHEN NEW.status = 'resolved' AND OLD.status != 'resolved' AND NEW.resolved_at IS NULL
BEGIN
  UPDATE tickets 
  SET resolved_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;
CREATE TRIGGER trigger_clear_resolved_at
AFTER UPDATE OF status ON tickets
FOR EACH ROW
WHEN NEW.status != 'resolved' AND OLD.status = 'resolved'
BEGIN
  UPDATE tickets 
  SET resolved_at = NULL 
  WHERE id = NEW.id;
END;
CREATE TRIGGER trigger_comments_updated_at
AFTER UPDATE ON ticket_comments
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE ticket_comments 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;
CREATE TRIGGER trigger_history_assignment_change
AFTER UPDATE OF assigned_to ON tickets
FOR EACH ROW
WHEN NEW.assigned_to != OLD.assigned_to OR (NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS NULL)
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value)
  VALUES (NEW.id, NEW.assigned_to, 'assigned', 'assigned_to', OLD.assigned_to, NEW.assigned_to);
END;
CREATE TRIGGER trigger_history_equipment_added
AFTER INSERT ON ticket_equipment
FOR EACH ROW
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, new_value)
  VALUES (NEW.ticket_id, NEW.added_by, 'equipment_added', 'equipment_id', NEW.equipment_id);
  
  UPDATE tickets 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.ticket_id;
END;
CREATE TRIGGER trigger_history_equipment_removed
AFTER DELETE ON ticket_equipment
FOR EACH ROW
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value)
  VALUES (OLD.ticket_id, OLD.added_by, 'equipment_removed', 'equipment_id', OLD.equipment_id);
  
  UPDATE tickets 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = OLD.ticket_id;
END;
CREATE TRIGGER trigger_history_priority_change
AFTER UPDATE OF priority ON tickets
FOR EACH ROW
WHEN NEW.priority != OLD.priority
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value)
  VALUES (NEW.id, NEW.assigned_to, 'priority_changed', 'priority', OLD.priority, NEW.priority);
END;
CREATE TRIGGER trigger_history_status_change
AFTER UPDATE OF status ON tickets
FOR EACH ROW
WHEN NEW.status != OLD.status
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value)
  VALUES (NEW.id, NEW.assigned_to, 'status_changed', 'status', OLD.status, NEW.status);
END;
CREATE TRIGGER trigger_history_ticket_created
AFTER INSERT ON tickets
FOR EACH ROW
BEGIN
  INSERT INTO ticket_history (ticket_id, user_id, action)
  VALUES (NEW.id, NEW.user_id, 'ticket_created');
END;
CREATE TRIGGER trigger_tickets_updated_at
AFTER UPDATE ON tickets
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE tickets 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;
CREATE TRIGGER trigger_update_ticket_on_comment
AFTER INSERT ON ticket_comments
FOR EACH ROW
BEGIN
  UPDATE tickets 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.ticket_id;
END;
CREATE TRIGGER trigger_update_ticket_on_time_log
AFTER INSERT ON ticket_time_logs
FOR EACH ROW
BEGIN
  UPDATE tickets 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.ticket_id;
END;
CREATE TRIGGER trigger_validate_close_ticket
BEFORE UPDATE OF status ON tickets
FOR EACH ROW
WHEN NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.resolved_at IS NULL
BEGIN
  SELECT RAISE(ABORT, 'Cannot close ticket without resolving it first');
END;
CREATE TRIGGER update_equipment_timestamp 
AFTER UPDATE ON equipment
BEGIN
    UPDATE equipment SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
COMMIT;
