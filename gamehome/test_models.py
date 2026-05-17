from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import MemberWinPost, MemberLosePost, MemberDrawPost, MemberMovePost, MemberAvatar, MemberChoice, MemberInformation


class MemberWinPostModelTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='modeluser', password='testpass', email='modeluser@example.com')
		MemberInformation.objects.create(user=self.user, gamername='modeluser', status='novice')

	def test_max_win_comments_per_user(self):
		# User can have up to 10 winposts
		for i in range(9):
			MemberWinPost.objects.create(user=self.user, winpost=f"Win {i}")
		self.assertEqual(MemberWinPost.objects.filter(user=self.user).count(), 9)
		# 10th post should NOT raise
		post = MemberWinPost(user=self.user, winpost="Win 9")
		post.clean()  # Should not raise
		post.save()
		self.assertEqual(MemberWinPost.objects.filter(user=self.user).count(), 10)
		# 11th post should raise
		with self.assertRaises(ValidationError):
			post = MemberWinPost(user=self.user, winpost="Win 10")
			post.clean()
		self.assertEqual(MemberWinPost.objects.filter(user=self.user).count(), 10)


class MemberAvatarModelTest(TestCase):
	def setUp(self):
		self.user_novice = User.objects.create_user(username='novice', password='testpass', email='novice@example.com')
		self.user_seasoned = User.objects.create_user(username='seasoned', password='testpass', email='seasoned@example.com')
		MemberInformation.objects.create(user=self.user_novice, gamername='novice', status='novice')
		MemberInformation.objects.create(user=self.user_seasoned, gamername='seasoned', status='seasoned')

	def test_avatar_not_allowed_for_novice(self):
		avatar = MemberAvatar(user=self.user_novice)
		with self.assertRaises(ValidationError):
			avatar.clean()

	def test_avatar_allowed_for_seasoned(self):
		avatar = MemberAvatar(user=self.user_seasoned)
		# Should not raise
		try:
			avatar.clean()
		except ValidationError:
			self.fail("Avatar clean() raised ValidationError unexpectedly!")


class MemberChoiceModelTest(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='choiceuser', password='testpass', email='choiceuser@example.com')
		MemberInformation.objects.create(user=self.user, gamername='choiceuser', status='seasoned')

	def test_default_choice(self):
		choice = MemberChoice.objects.create(user=self.user)
		self.assertEqual(choice.choice, 'Standard')

	def test_piece_identifier_field(self):
		choice = MemberChoice.objects.create(user=self.user, choice='Selection', piece_identifier='robot_0')
		self.assertEqual(choice.piece_identifier, 'robot_0')
