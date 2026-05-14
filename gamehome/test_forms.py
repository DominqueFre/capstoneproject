from django.contrib.auth.models import User
from django.test import TestCase
from .forms import MemberCommentForm, MemberAvatarForm, MemberChoiceForm

# Create your tests here. AI generated test cases for forms in gamehome/forms.py
#   def setUp(self):
#         self.user = User.objects.create_superuser(
#             username="myUsername",
#             password="myPassword",
#             email="test@test.com"
#         )


class MemberAvatarFormTest(TestCase):
    def setUpF(self):
        self.userf = User.objects.create_user(
            username='testuserf',
            password='testpassf',
            email='testuserf@example.com'
            )
        self.client.login(username='testuserf', password='testpassf', email='testuserf@example.com')

    def test_valid_avatar_data(self):
        form = MemberAvatarForm(data={
            'avatar_image': 'path/to/avatar.png'
        })
        self.assertTrue(form.is_valid())

    def test_missing_avatar(self):
        form = MemberAvatarForm(data={})
        self.assertFalse(form.is_valid())
        self.assertIn('avatar_image', form.errors)


class MemberChoiceFormTest(TestCase):
    def test_valid_choice(self):
        form = MemberChoiceForm(data={
            'choice': 'option1'
        })
        self.assertTrue(form.is_valid())

    def test_invalid_choice(self):
        form = MemberChoiceForm(data={
            'choice': 'invalid_option'
        })
        self.assertFalse(form.is_valid())
        self.assertIn('choice', form.errors)


class MemberCommentFormTest(TestCase):
    def test_valid_data(self):
        form = MemberCommentForm(data={
            'message_type': 'win',
            'comment_text': 'Great game!',
            'comment_id': 1
        })
        self.assertTrue(form.is_valid())

    def test_empty_comment(self):
        form = MemberCommentForm(data={
            'message_type': 'lose',
            'comment_text': '   ',  # Only whitespace
            'comment_id': 2
        })
        self.assertFalse(form.is_valid())
        self.assertIn('comment_text', form.errors)

    def test_invalid_message_type(self):
        form = MemberCommentForm(data={
            'message_type': 'invalid_type',
            'comment_text': 'This should fail.',
            'comment_id': 3
        })
        self.assertFalse(form.is_valid())
        self.assertIn('message_type', form.errors)
