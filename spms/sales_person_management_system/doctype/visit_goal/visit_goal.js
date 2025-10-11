// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Visit Goal', {
    onload: function(frm) {
        // Set default 'from' date to the start of the current month
        if (!frm.doc.from) {
            frm.set_value('from', frappe.datetime.month_start());
        }

        // Set default 'to' date to the end of the current month
        if (!frm.doc.to) {
            frm.set_value('to', frappe.datetime.month_end());
        }
    },

    to: function(frm) {
        // Validate 'to' date is not before 'from' date
        if (frm.doc.to < frm.doc.from) {
            frappe.msgprint("اختر مدة صحيحة");
            frm.set_value('to', frappe.datetime.month_end());  // Optionally reset to end of month
        }

        // Calculate and set the difference in days between 'from' and 'to'
        const diff_days = frappe.datetime.get_day_diff(frm.doc.to, frm.doc.from);
        frm.set_value("number_of_days", diff_days);
    },

    refresh: function(frm) {
        // Set query filter on the 'doctor' field in the 'doctor_visit_goal' child table
        frm.set_query('doctor', 'doctor_visit_goal', function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Doctor', 'territory', 'in', frm.doc.territory]
                ]
            };
        });
    }
});
