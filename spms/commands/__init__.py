# Copyright (c) 2024, aoai and Contributors
# License: MIT. See LICENSE

import click


def call_command(cmd, context):
	return click.Context(cmd, obj=context).forward(cmd)


commands = [] 