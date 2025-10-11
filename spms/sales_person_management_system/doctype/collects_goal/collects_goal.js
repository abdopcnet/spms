// File: /home/frappe/frappe-bench/apps/spms/spms/sales_person_management_system/doctype/collects_goal/collects_goal.js

frappe.ui.form.on('Collects Goal', {
    onload: function(frm) {
        // Set default 'from' date to the start of the current month if not set
        if (!frm.doc.from) {
            frm.set_value('from', frappe.datetime.month_start());
        }

        // Set default 'to' date to the end of the current month if not set
        if (!frm.doc.to) {
            frm.set_value('to', frappe.datetime.month_end());
        }
    },

    to: function(frm) {
        // Validate 'to' date is not before 'from' date
        if (frm.doc.to && frm.doc.to < frm.doc.from) {
            frappe.msgprint("اختر مدة صحيحة");
            frm.set_value('to', frappe.datetime.month_end());  // Reset 'to' date
        }

        // Calculate and set the difference in days between 'from' and 'to'
        if (frm.doc.from && frm.doc.to) {
            const diff_days = frappe.datetime.get_day_diff(frm.doc.to, frm.doc.from);
            frm.set_value("number_of_days", diff_days);
        }
    },

    refresh: function(frm) {
        // Fetch customers with outstanding invoices and apply as a filter to 'customer' field
        frappe.call({
            method: "spms.sales_person_management_system.doctype.collects_goal.collects_goal.fetch_customers_with_outstanding_invoices",
            callback: function(r) {
                if (r.message) {
                    const customers_with_outstanding = r.message;
                    frm.fields_dict['customer_collects_goal'].grid.get_field('customer').get_query = function() {
                        return {
                            filters: [["Customer", "name", "in", customers_with_outstanding]]
                        };
                    };
                }
            }
        });

        // Filter customer invoices in the child table based on the selected customer
        frm.fields_dict['customer_collects_goal'].grid.get_field('customer_invoices').get_query = function(doc, cdt, cdn) {
            let row = locals[cdt][cdn];
            if (row.customer) {
                return {
                    filters: {
                        'customer': row.customer,
                        'docstatus': 1,  // Only open invoices
                        'outstanding_amount': ['>', 0]  // Only invoices with outstanding amounts
                    }
                };
            }
        };
    }
});



// Trigger On Every Event On [amount_to_collect] Field
frappe.ui.form.on('Customer Collects Goal', {
    amount_to_collect: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];  // Get the current row data

        // Check if amount_to_collect is greater than outstanding_amount
        if (flt(row.amount_to_collect) > flt(row.outstanding_amount)) {
            // Show an error message
            frappe.msgprint(__('لا يمكن ادخال تحصيل مستهدف اكبر من المستحق'));
            
            // Reset the amount_to_collect value to its previous value
            frappe.model.set_value(cdt, cdn, 'amount_to_collect', 0);
        }

        // Call update_total_targets to recalculate total when amount_to_collect is changed
        update_total_targets(frm);
    }
});

// Consolidated function to update total targets
function update_total_targets(frm) {
    var total = 0;
    $.each(frm.doc.customer_collects_goal || [], function (i, d) {
        total += flt(d.amount_to_collect);  // Sum up the amounts
    });
    frm.set_value("total_targets", total);
}

