// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Collecting', {
    collects_goal: function(frm) {
        if (frm.doc.collects_goal) {
            frappe.call({
                method: "spms.sales_person_management_system.doctype.collecting.collecting.get_customers_from_collects_goal",
                args: {
                    collects_goal_id: frm.doc.collects_goal
                },
                callback: function(r) {
                    if (r.message) {
                        const customers = r.message;
                        frm.set_query("customer", function() {
                            return {
                                filters: [
                                    ["Customer", "name", "in", customers]
                                ]
                            };
                        });
                    }
                }
            });
        } else {
            frm.set_query("customer", function() {
                return {};
            });
        }
    }
});













frappe.ui.form.on('Collecting', {
    refresh: function(frm) {
        // Add custom button "Get Customer Invoices"
        frm.add_custom_button(__('Get Customer Invoices'), function() {
            if (frm.doc.collects_goal && frm.doc.customer) {
                // Call Python function to fetch invoices based on collects_goal and customer name
                frappe.call({
                    method: "spms.sales_person_management_system.doctype.collecting.collecting.fetch_invoices_from_customer_collects_goal",
                    args: {
                        collects_goal_id: frm.doc.collects_goal,  // Pass Collects Goal ID
                        customer_name: frm.doc.customer  // Pass Customer name
                    },
                    callback: function(r) {
                        if (r.message) {
                            const invoices = r.message;  // List of invoices to populate child table

                            // Clear existing rows in invoices child table
                            frm.clear_table('invoices');

                            // Add new rows to invoices child table
                            invoices.forEach(function(invoice) {
                                let row = frm.add_child('invoices');
                                row.customer_invoices = invoice.customer_invoices;
                                row.status = invoice.status;
                                row.date = invoice.date;
                                row.due_date = invoice.due_date;
                                row.invoice_amount = invoice.invoice_amount;
                                row.outstanding_amount = invoice.outstanding_amount;
                                row.amount_to_collect = invoice.amount_to_collect;
                            });

                            // Refresh child table to display new rows
                            frm.refresh_field('invoices');
                        } else {
                            frappe.msgprint(__('No invoices found for the selected Collects Goal and Customer.'));
                        }
                    }
                });
            } else {
                frappe.msgprint(__('يجب إنشاء تحصيل من خطة التحصيل أولا.'));
            }
        });
    }
});














frappe.ui.form.on('Collecting', {
    refresh: function(frm) {
        // التأكد من تحديث قيم المتبقي عند فتح النموذج
        if (frm.doc.invoices && frm.doc.invoices.length > 0) {
            frm.doc.invoices.forEach(function(row) {
                update_remaining_amount(frm, row.doctype, row.name);
            });
        }
    },

    // في حالة تغيير قيمة المبلغ المحصل
    collected_amount: function(frm, cdt, cdn) {
        update_remaining_amount(frm, cdt, cdn);
    }
});

// دالة لحساب المتبقي
function update_remaining_amount(frm, cdt, cdn) {
    var row = locals[cdt][cdn];  // الحصول على السطر الحالي

    // إذا كانت قيمة collected_amount فارغة، إعادة تعيين remaining_amount إلى outstanding_amount
    if (!row.collected_amount || flt(row.collected_amount) === 0) {
        frappe.model.set_value(cdt, cdn, 'remaining_amount', flt(row.outstanding_amount));
        frm.refresh_field('invoices');
        return;
    }

    // التأكد من أن المبلغ المحصل ليس سالبًا
    if (flt(row.collected_amount) < 0) {
        frappe.throw(__('لا يمكن إدخال قيمة تحصيل سالبة.'));
    }

    var remaining_amount = flt(row.outstanding_amount) - flt(row.collected_amount);

    // التأكد من أن المتبقي لا يصبح سالبًا
    if (remaining_amount < 0) {
        remaining_amount = 0;
    }

    // تحديث قيمة المتبقي
    frappe.model.set_value(cdt, cdn, 'remaining_amount', remaining_amount);

    // إذا كانت قيمة المحصل أكبر من المتبقي، منع الحفظ وظهور رسالة
    if (flt(row.collected_amount) > flt(row.outstanding_amount)) {
        frappe.throw(__('لا يمكن تسجيل تحصيل اعلي من المتبقي علي العميل.'));
    }

    // تحديث النموذج بعد التعديل
    frm.refresh_field('invoices');
}




















// Get Location From The User
frappe.ui.form.on('Collecting', {
	onload(frm) {
		function onPositionRecieved(position) {
			var longitude = position.coords.longitude;
			var latitude = position.coords.latitude;
			frm.set_value('longitude', longitude);
			frm.set_value('latitude', latitude);
			fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
				.then(response => response.json())
				.then(data => {
					var address = data['results'][0].formatted;
					frm.set_value('current_address', address);
				})
				.catch(err => console.log(err));
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		}

		function locationNotRecieved(positionError) {
			console.log(positionError);
		}

		if (frm.doc.longitude && frm.doc.latitude) {
			frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://yt2.org/youtube-to-mp3-ALeKk00qEW0sxByTDSpzaRvl8WxdMAeMytQ1611842368056QMMlSYKLwAsWUsAfLipqwCA2ahUKEwiikKDe5L7uAhVFCuwKHUuFBoYQ8tMDegUAQCSAQCYAQCqAQdnd3Mtd2l6"></a><br><style>.mapouter{position:relative;text-align:right;height:300px;width:100%;}</style><style>.gmap_canvas {overflow:hidden;background:none!important;height:300px;width:100%;}</style></div></div>');
			frm.refresh_field('my_location');
		} else {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(onPositionRecieved, locationNotRecieved, { enableHighAccuracy: true });
			} else {
				frappe.msgprint('يرجي تفعيل خدمة الموقع');
			}
		}
	}
});


// Validate If Location Service Is Off
frappe.ui.form.on('Collecting', {
	before_save: function (frm) {
		if (!frm.doc.longitude && !frm.doc.latitude) {
			frappe.msgprint('يرجي تفعيل خدمة الموقع');
		}
	}
});


