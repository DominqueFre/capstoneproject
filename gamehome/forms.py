from django import forms
from .models import MemberAvatar, MemberChoice


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


class MemberAvatarForm(forms.ModelForm):
    class Meta:
        model = MemberAvatar
        fields = ["avatar_image"]
        widgets = {
            "avatar_image": forms.URLInput(
                attrs={
                    "placeholder": "Enter image URL from Cloudinary",
                    "readonly": "readonly",
                }
            ),
        }
        labels = {
            "avatar_image": "Avatar Image URL",
        }


class MemberChoiceForm(forms.ModelForm):
    class Meta:
        model = MemberChoice
        fields = ["choice"]
        widgets = {
            "choice": forms.RadioSelect(),
        }
        labels = {
            "choice": "Game Piece Choice",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Update choices to include "Selection" option for Seasoned+
        self.fields['choice'].choices = [
            ("Random", "Random"),
            ("X", "X"),
            ("O", "O"),
            ("Selection", "Selected from gallery"),
        ]
