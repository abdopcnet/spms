# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Collecting(Document):
	pass

  

@frappe.whitelist()
def get_customers_from_collects_goal(collects_goal_id):
    # This function fetches customers from the Collects Goal child table.
    print(f"Collects Goal ID: {collects_goal_id}")  # Server-side log

    # SQL query to fetch the customers associated with the given collects_goal_id
    customers = frappe.db.sql("""
        SELECT customer 
        FROM `tabCustomer Collects Goal`
        WHERE parent = %s
        GROUP BY customer
    """, (collects_goal_id,), as_list=True)

    # Return a list of customer names
    return [customer[0] for customer in customers]
  




@frappe.whitelist()
def fetch_invoices_from_customer_collects_goal(collects_goal_id, customer_name):
    # Fetch data from Customer Collects Goal table based on collects_goal_id and customer_name
    customer_collects_goal_data = frappe.db.sql("""
        SELECT customer_invoices, status, date, due_date, invoice_amount, outstanding_amount, amount_to_collect
        FROM `tabCustomer Collects Goal`
        WHERE parent = %s AND customer = %s
    """, (collects_goal_id, customer_name), as_dict=True)

    # Prepare data to return for invoices child table
    invoices_data = []
    if customer_collects_goal_data:
        for row in customer_collects_goal_data:
            invoices_data.append({
                'customer_invoices': row['customer_invoices'],
                'status': row['status'],
                'date': row['date'],
                'due_date': row['due_date'],
                'invoice_amount': row['invoice_amount'],
                'outstanding_amount': row['outstanding_amount'],
                'amount_to_collect': row['amount_to_collect']
            })

    return invoices_data
