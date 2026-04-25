class AGENLBlockedError(Exception):
    """Raised when a tool call is blocked by the AGENL contract."""

    def __init__(self, message, tool_name=None):
        super().__init__(message)
        self.tool_name = tool_name


class AGENLEscalationError(Exception):
    """Raised when an on_uncertain or on_error policy triggers escalation."""

    def __init__(self, message, context=None):
        super().__init__(message)
        self.context = context or {}


class AGENLConfirmationRequired(Exception):
    """Raised when a tool is in the confirm list and has not been approved."""

    def __init__(self, message, tool_name=None, args=None, kwargs=None):
        super().__init__(message)
        self.tool_name = tool_name
        self.args = args or ()
        self.kwargs = kwargs or {}
