from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from .models import MemberMovePost, MemberWinPost, MemberLosePost, MemberDrawPost
from .models import MemberAvatar, MemberChoice, GameScore, MemberInformation
# Create your tests here. AI generated test cases for views in gamehome/views.py


class GameHomeViewAccessTest(TestCase):
    def test_gamehome_view_login_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        login_url = reverse('account_login')
        self.assertContains(response, login_url)

    def test_gamehome_view_nologout_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        logout_url = reverse('account_logout')
        self.assertNotContains(response, logout_url)

    def test_gamehome_view_signup_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        signup_url = reverse('account_signup')
        self.assertContains(response, signup_url)

    def test_gamehome_view_profile_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        profile_url = reverse('gamehome:profile')
        self.assertNotContains(response, profile_url)

    def test_gamehome_view_leaderboard_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        leaderboard_url = reverse('gamehome:leaderboard')
        self.assertContains(response, leaderboard_url)

# to review
class GameHomeViewAvatarUploadTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testusera', password='testpassa', email='testusera@example.com')
        MemberInformation.objects.create(user=self.user, gamername='testusera', status='seasoned')
        self.client.login(username='testusera', password='testpassa', email='testusera@example.com')

    def test_avatar_upload(self):
        with open('path/to/test/avatar.png', 'rb') as avatar_file:
            response = self.client.post(
                reverse('gamehome:home'),
                {
                    'avatar_image': avatar_file
                }
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberAvatar.objects.filter(user=self.user).exists())


# to review
class GameHomeViewChoiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuserc', password='testpassc', email='testuserc@example.com')
        self.client.login(username='testuserc', password='testpassc', email='testuserc@example.com')

    def test_valid_choice_submission(self):
        response = self.client.post(reverse('gamehome:home'), {
            'choice': 'option1'
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberChoice.objects.filter(user=self.user, choice='option1').exists())

    def test_invalid_choice_submission(self):
        response = self.client.post(reverse('gamehome:home'), {
            'choice': 'invalid_option'
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(MemberChoice.objects.filter(user=self.user, choice='invalid_option').exists())


# to review
class GameHomeViewPostTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuserp', password='testpassp', email='testuserp@example.com')
        MemberInformation.objects.create(user=self.user, gamername='testuserp', status='novice')
        self.client.login(username='testuserp', password='testpassp', email='testuserp@example.com')

    def test_post_win_comment(self):
        count_before = MemberWinPost.objects.filter(user=self.user).count()
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'win',
            'comment_text': 'Great game!',
        })
        count_after = MemberWinPost.objects.filter(user=self.user).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberWinPost.objects.filter(user=self.user, winpost='Great game!').exists())

    def test_post_lose_comment(self):
        count_before = MemberLosePost.objects.filter(user=self.user).count()
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'lose',
            'comment_text': 'Tough loss!',
        })
        count_after = MemberLosePost.objects.filter(user=self.user).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberLosePost.objects.filter(user=self.user, losepost='Tough loss!').exists())

    def test_post_draw_comment(self):
        count_before = MemberDrawPost.objects.filter(user=self.user).count()
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'draw',
            'comment_text': 'Close game!',
        })
        count_after = MemberDrawPost.objects.filter(user=self.user).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberDrawPost.objects.filter(user=self.user, drawpost='Close game!').exists())

    def test_post_move_comment(self):
        count_before = MemberDrawPost.objects.filter(user=self.user).count()
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'move',
            'comment_text': 'Great move!',
        })
        count_after = MemberMovePost.objects.filter(user=self.user).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberMovePost.objects.filter(user=self.user, movepost='Great move!').exists())

    def test_post_invalid_message_type(self):
        count_before = MemberWinPost.objects.filter(user=self.user).count()
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'invalid',
            'comment_text': 'This should not work.',
        })
        count_after = MemberWinPost.objects.filter(user=self.user).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before)
        self.assertFalse(MemberWinPost.objects.filter(user=self.user, winpost='This should not work.').exists())
        self.assertFalse(MemberLosePost.objects.filter(user=self.user, losepost='This should not work.').exists())
        self.assertFalse(MemberDrawPost.objects.filter(user=self.user, drawpost='This should not work.').exists())
        self.assertFalse(MemberMovePost.objects.filter(user=self.user, movepost='This should not work.').exists())

# to test new logged in user functionalities in gamehome/views.py
class GameHomeViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testusert',
            password='testpasst',
            email='testusert@example.com'
            )
        self.client.login(username='testusert', password='testpasst', email='testusert@example.com')

    def test_user_starts_as_novice(self):
        member_info = self.user.member_info
        self.assertEqual(member_info.status, "novice")

    def checkGamername_in_context(self, response):
        self.assertIn('member_info', response.context)
        member_info = response.context['member_info']
        self.assertEqual(member_info.gamername, self.user.username)

    def setGamername_in_context(self, response):
        self.assertIn('member_info', response.context)
        member_info = response.context['member_info']
        member_info.gamername = 'NewGamername'
        member_info.save()
        self.assertEqual(member_info.gamername, 'NewGamername')

    def checkNewGamername_in_context(self, response):
        self.assertIn('member_info', response.context)
        member_info = response.context['member_info']
        self.assertEqual(member_info.gamername, 'NewGamername')

    def test_gamehome_view_status_code(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertEqual(response.status_code, 200)

    def test_gamehome_view_template(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertTemplateUsed(response, 'gamehome/play.html')

    def test_user_accessible_and_inaccessible_urls(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertContains(response, reverse('logout'))
        self.assertContains(response, reverse('profile'))
        self.assertContains(response, reverse('leaderboard'))
        self.assertNotContains(response, reverse('login'))
        self.assertNotContains(response, reverse('signup'))
        self.assertNotContains(response, '/admin/')  # admin is usually not in reverse

    def test_gamehome_view_profile(self):
        response = self.client.get(reverse('gamehome:profile'))
        self.assertTemplateUsed(response, 'gamehome/profile.html')

    def test_gamehome_view_leaderboard(self):
        response = self.client.get(reverse('gamehome:leaderboard'))
        self.assertTemplateUsed(response, 'gamehome/leaderboard.html')

    def test_gamehome_view_context(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('member_info', response.context)
        self.assertIn('win_percentage', response.context)
        self.assertIn('total_percentage', response.context)
        self.assertIn('winpost', response.context)
        self.assertIn('losepost', response.context)
        self.assertIn('drawpost', response.context)
        self.assertIn('movepost', response.context)
        self.assertIn('avatar_form', response.context)
        self.assertIn('comment_form', response.context)
        self.assertIn('choice_form', response.context)
        self.assertIn('avatar_url', response.context)
        self.assertIn('gamername', response.context)
        # Additional assertions can be added here to check the content of the context variables if needed.

    def test_gamehome_view_game_results_recorded_and_retrieved(self):
        GameScore.objects.create(
            user=self.user, difficulty='easy', outcome='W'
        )
        GameScore.objects.create(
            user=self.user, difficulty='easy', outcome='W'
        )
        GameScore.objects.create(
            user=self.user, difficulty='easy', outcome='L'
        )
        GameScore.objects.create(
            user=self.user, difficulty='easy', outcome='D'
        )
        GameScore.objects.create(
            user=self.user, difficulty='normal', outcome='W'
        )
        GameScore.objects.create(
            user=self.user, difficulty='normal', outcome='W'
        )
        GameScore.objects.create(
            user=self.user, difficulty='normal', outcome='L'
        )
        GameScore.objects.create(
            user=self.user, difficulty='normal', outcome='D'
        )
        response = self.client.get(reverse('gamehome:home'))
        scores = response.context['recent_scores']
        self.assertEqual(scores.count(), 8)
        self.assertEqual(scores[0].outcome, 'W')
        self.assertEqual(scores[2].outcome, 'L')
        self.assertEqual(scores[4].outcome, 'W')
        self.assertEqual(response.context['win_percentage'], 50.0)
        self.assertEqual(response.context['total_percentage'], 75.0)

    def test_gamehome_view_with_winposts(self):
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'win',
            'comment_text': 'Great win!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberWinPost.objects.filter(user=self.user, winpost='Great win!').exists())
        self.assertIn('winpost', response.context)

    def test_gamehome_view_with_lose_posts(self):
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'lose',
            'comment_text': 'Tough loss!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberLosePost.objects.filter(user=self.user, losepost='Tough loss!').exists())
        self.assertIn('losepost', response.context)

    def test_gamehome_view_with_draw_posts(self):
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'draw',
            'comment_text': 'Close game!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberDrawPost.objects.filter(user=self.user, drawpost='Close game!').exists())
        self.assertIn('drawpost', response.context)

    def test_gamehome_view_with_move_posts(self):
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'move',
            'comment_text': 'Great move!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberMovePost.objects.filter(user=self.user, movepost='Great move!').exists())
        self.assertIn('movepost', response.context)
