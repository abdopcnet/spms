from frappe.utils import flt


def calculate_contribution(self) -> None:

    if not self.meta.get_field("sales_team"):
        return

    sales_team = self.get("sales_team")
    for sales_person in sales_team:
        self.round_floats_in(sales_person)

        if sales_person.commission_rate:
            sales_person.incentives = flt(
                self.amount_eligible_for_commission
                * flt(sales_person.commission_rate)
                / 100.0,
                self.precision("incentives", sales_person),
            )