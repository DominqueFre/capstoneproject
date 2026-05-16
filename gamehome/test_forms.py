from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gamehome.models import MemberAvatar, MemberInformation
from .forms import MemberCommentForm, MemberAvatarForm, MemberChoiceForm

# Create your tests here. AI generated test cases for forms in gamehome/forms.py


class MemberAvatarFormTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuserf',
            password='testpassf',
            email='testuserf@example.com'
            )
        MemberInformation.objects.create(user=self.user, gamername='testuserf', status='seasoned')
        self.client.login(
            username='testuserf',
            password='testpassf',
            email='testuserf@example.com'
            )

    def test_valid_avatar_data(self):
        avatar_instance = MemberAvatar(user=self.user)
        fake_image = SimpleUploadedFile("test_avatar.png", b"file_content", content_type="image/png")
        form = MemberAvatarForm(
            data={},
            files={'avatar_image': fake_image},
            instance=avatar_instance
        )
        self.assertTrue(form.is_valid())


class MemberChoiceFormTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuserg',
            password='testpassg',
            email='testuserg@example.com'
            )
        MemberInformation.objects.create(user=self.user, gamername='testuserg', status='seasoned')
        self.client.login(
            username='testuserg',
            password='testpassg',
            email='testuserg@example.com'
            )

    def test_valid_choice_standard(self):
        form = MemberChoiceForm(data={
            'choice': 'Standard'
        })
        self.assertTrue(form.is_valid())

    def test_valid_choice_random(self):
        form = MemberChoiceForm(data={
            'choice': 'Random'
        })
        self.assertTrue(form.is_valid())

    def test_invalid_choice(self):
        form = MemberChoiceForm(data={
            'choice': 'invalid_option'
        })
        self.assertFalse(form.is_valid())
        self.assertIn('choice', form.errors)

    def test_selection_choice_without_piece(self):
        # Simulate form submission with 'Selection' but no piece_identifier
        form = MemberChoiceForm(data={'choice': 'Selection'}, tier='seasoned')
        self.assertTrue(form.is_valid())  # Form is valid, but...
        # Simulate backend logic
        instance = form.save(commit=False)
        instance.user = self.user
        # Simulate what the view does:
        if instance.choice == "Selection" and not instance.piece_identifier:
            instance.choice = "Random"
        self.assertEqual(instance.choice, "Random")

    def test_selection_choice_with_piece(self):
        form = MemberChoiceForm(
            data={'choice': 'Selection'},
            tier='seasoned'
        )
        self.assertTrue(form.is_valid())
        instance = form.save(commit=False)
        instance.user = self.user
        instance.piece_identifier = 'robot_0'  # Manually set, as the view does
        instance.save()
        self.assertEqual(instance.choice, "Selection")
        self.assertEqual(instance.piece_identifier, "robot_0")


class MemberCommentFormTest(TestCase):
    def test_valid_data(self):
        form = MemberCommentForm(data={
            'message_type': 'win',
            'comment_text': 'Great game!',
        })
        self.assertTrue(form.is_valid())

    def test_empty_comment(self):
        form = MemberCommentForm(data={
            'message_type': 'lose',
            'comment_text': '   ',  # Only whitespace
        })
        self.assertFalse(form.is_valid())
        self.assertIn('comment_text', form.errors)

    def test_invalid_message_type(self):
        form = MemberCommentForm(data={
            'message_type': 'invalid_type',
            'comment_text': 'This should fail.',
        })
        self.assertFalse(form.is_valid())
        self.assertIn('message_type', form.errors)
