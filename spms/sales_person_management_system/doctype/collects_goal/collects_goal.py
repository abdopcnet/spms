# File: /home/frappe/frappe-bench/apps/spms/spms/sales_person_management_system/doctype/collects_goal/collects_goal.py

import frappe
from frappe.model.document import Document

class CollectsGoal(Document):
    def before_save(self):
        # Ensure a valid target period
        if self.number_of_days <= 0:
            if self.number_of_days == 0:
                frappe.throw("The target period cannot be set to 0 days.")
            else:
                frappe.throw("Please enter a valid period for the target.")

@frappe.whitelist()
def fetch_customers_with_outstanding_invoices():
    # Query to get distinct customers with outstanding invoices
    customers = frappe.db.sql("""
        SELECT DISTINCT customer 
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND outstanding_amount > 0
    """, as_dict=True)
    return [customer['customer'] for customer in customers]

