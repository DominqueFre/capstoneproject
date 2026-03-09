from django import forms


class MemberCommentForm(forms.Form):
    MESSAGE_TYPE_CHOICES = [
        ("win", "Win"),
        ("lose", "Lose"),
        ("draw", "Draw"),
        ("move", "Move"),
    ]

    message_type = forms.ChoiceField(choices=MESSAGE_TYPE_CHOICES)
    comment_text = forms.CharField(
        max_length=200,
        widget=forms.Textarea(attrs={"rows": 3}),
    )
    comment_id = forms.IntegerField(required=False, widget=forms.HiddenInput())

    def clean_comment_text(self):
        value = self.cleaned_data["comment_text"].strip()
        if not value:
            raise forms.ValidationError("Comment cannot be empty.")
        return value
