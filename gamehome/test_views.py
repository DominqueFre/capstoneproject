import json
from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from .models import MemberMovePost, MemberWinPost, MemberLosePost, MemberDrawPost
from .models import MemberAvatar, MemberChoice, GameScore, MemberInformation
from django.core.files.uploadedfile import SimpleUploadedFile
# Create your tests here. AI generated test cases for views in gamehome/views.py


# --- SubmitScoreApiTest: tests for the submit_score API endpoint ---
class SubmitScoreApiTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='scoreuser', password='scorepass', email='scoreuser@example.com')
        MemberInformation.objects.create(user=self.user, gamername='scoreuser', status='novice')
        self.url = reverse('gamehome:submit_score')

    def test_submit_score_success(self):
        self.client.login(username='scoreuser', password='scorepass')
        payload = {"difficulty": "easy", "outcome": "W"}
        response = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("ok"))
        self.assertIn("score_id", data)
        self.assertTrue(GameScore.objects.filter(user=self.user, difficulty="easy", outcome="W").exists())

    def test_submit_score_unauthenticated(self):
        payload = {"difficulty": "easy", "outcome": "W"}
        response = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertFalse(data.get("ok"))
        self.assertEqual(data.get("error"), "authentication required")

    def test_submit_score_invalid_difficulty(self):
        self.client.login(username='scoreuser', password='scorepass')
        payload = {"difficulty": "invalid", "outcome": "W"}
        response = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data.get("ok"))
        self.assertEqual(data.get("error"), "invalid difficulty")

    def test_submit_score_invalid_outcome(self):
        self.client.login(username='scoreuser', password='scorepass')
        payload = {"difficulty": "easy", "outcome": "Z"}
        response = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data.get("ok"))
        self.assertEqual(data.get("error"), "invalid outcome")

    def test_submit_score_invalid_json(self):
        self.client.login(username='scoreuser', password='scorepass')
        response = self.client.post(self.url, data="notjson", content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data.get("ok"))
        self.assertEqual(data.get("error"), "invalid JSON")


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


class GameHomeViewAvatarUploadTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testusera', password='testpassa', email='testusera@example.com')
        MemberInformation.objects.create(user=self.user, gamername='testusera', status='seasoned')
        self.client.login(username='testusera', password='testpassa', email='testusera@example.com')

    def test_avatar_upload(self):
        fake_image = SimpleUploadedFile("test_avatar.png", b"file_content", content_type="image/png")
        response = self.client.post(
            reverse('gamehome:profile'),
            {
                'avatar_upload': fake_image,
            },
            format='multipart'
        )
        avatar = MemberAvatar.objects.get(user=self.user)
        self.assertTrue(MemberAvatar.objects.filter(user=self.user).exists())
        self.assertIsNotNone(avatar)
        self.assertEqual(response.status_code, 200)


# to review
class GameHomeViewChoiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuserc', password='testpassc', email='testuserc@example.com')
        MemberInformation.objects.create(user=self.user, gamername='testuserc', status='seasoned')
        self.client.login(username='testuserc', password='testpassc', email='testuserc@example.com')

    def test_valid_choice_submission(self):
        response = self.client.post(reverse('gamehome:save_piece_choice'), {
            'choice': 'Selection',
            'piece_identifier': 'robot_0'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberChoice.objects.filter(user=self.user, choice='Selection', piece_identifier='robot_0').exists())

    def test_invalid_choice_submission(self):
        response = self.client.post(reverse('gamehome:save_piece_choice'), {
            'choice': 'invalid_option',
            'piece_identifier': 'robot_0'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(MemberChoice.objects.filter(user=self.user, choice='invalid_option').exists())


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
        MemberInformation.objects.create(user=self.user, gamername='testusert')
        self.client.login(username='testusert', password='testpasst', email='testusert@example.com')
        logged_in = self.client.login(username='testusert', password='testpasst')
        self.assertTrue(logged_in)

    def test_user_starts_as_novice(self):
        member_info = self.user.member_info
        self.assertEqual(member_info.status, "novice")

    def checkGamername_in_context(self, response):
        self.assertIn('profile_display_name', response.context)
        self.assertEqual(response.context['profile_display_name'], self.user.member_info.gamername)

    def setGamername_in_context(self, response):
        # This method is not meaningful for home view context, but keep for profile view if needed
        self.user.member_info.gamername = 'NewGamername'
        self.user.member_info.save()
        self.assertEqual(self.user.member_info.gamername, 'NewGamername')

    def checkNewGamername_in_context(self, response):
        self.assertIn('profile_display_name', response.context)
        self.assertEqual(response.context['profile_display_name'], 'NewGamername')

    def test_gamehome_view_status_code(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertEqual(response.status_code, 200)

    def test_gamehome_view_template(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertTemplateUsed(response, 'gamehome/play.html')

    def test_user_accessible_and_inaccessible_urls(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertTemplateUsed(response, 'gamehome/play.html')
        self.assertContains(response, f'href="{reverse("account_logout")}"')
        self.assertNotContains(response, f'href="{reverse("account_login")}"')
        self.assertNotContains(response, f'href="{reverse("account_signup")}"')
        self.assertNotContains(response, f'href="/admin/"')  # admin is usually not in reverse

    def test_gamehome_view_profile(self):
        response = self.client.get(reverse('gamehome:profile'))
        self.assertTemplateUsed(response, 'gamehome/profile.html')

    def test_user_accessible_and_inaccessible_urls_profile(self):
        response = self.client.get(reverse('gamehome:profile'))
        self.assertTemplateUsed(response, 'gamehome/profile.html')
        self.assertContains(response, f'href="{reverse("account_logout")}"')
        self.assertNotContains(response, f'href="{reverse("account_login")}"')
        self.assertNotContains(response, f'href="{reverse("account_signup")}"')
        self.assertNotContains(response, f'href="/admin/"')  # admin is usually not in reverse

    def test_gamehome_view_leaderboard(self):
        response = self.client.get(reverse('gamehome:leaderboard'))
        self.assertTemplateUsed(response, 'gamehome/leaderboard.html')
        self.assertContains(response, f'href="{reverse("account_logout")}"')
        self.assertNotContains(response, f'href="{reverse("account_login")}"')
        self.assertNotContains(response, f'href="{reverse("account_signup")}"')
        self.assertNotContains(response, f'href="/admin/"')  # admin is usually not in reverse

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

        # Request the leaderboard view
        response = self.client.get(reverse('gamehome:leaderboard'))
        current_user_row = response.context['current_user_row']

        # Assert the row exists and has the correct values
        self.assertIsNotNone(current_user_row)
        self.assertEqual(current_user_row['total'], 8)
        self.assertEqual(current_user_row['wins'], 4)
        self.assertEqual(current_user_row['losses'], 2)
        self.assertEqual(current_user_row['draws'], 2)
        self.assertEqual(current_user_row['win_percentage'], 50.0)
        self.assertEqual(current_user_row['total_percentage'], 75.0)

    def test_gamehome_view_with_winposts(self):
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'win',
            'comment_text': 'Great win!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberWinPost.objects.filter(user=self.user, winpost='Great win!').exists())
        self.assertIn('comments_by_type', response.context)
        self.assertIn('win', response.context['comments_by_type'])
        self.assertTrue(
            any(c['text'] == 'Great win!' for c in response.context['comments_by_type']['win'])
        )

    def test_gamehome_view_with_lose_posts(self):
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'lose',
            'comment_text': 'Tough loss!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberLosePost.objects.filter(user=self.user, losepost='Tough loss!').exists())
        self.assertIn('comments_by_type', response.context)
        self.assertIn('lose', response.context['comments_by_type'])
        self.assertTrue(
            any(c['text'] == 'Tough loss!' for c in response.context['comments_by_type']['lose'])
        )

    def test_gamehome_view_with_draw_posts(self):
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'draw',
            'comment_text': 'Close game!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberDrawPost.objects.filter(user=self.user, drawpost='Close game!').exists())
        self.assertIn('comments_by_type', response.context)
        self.assertIn('draw', response.context['comments_by_type'])
        self.assertTrue(
            any(c['text'] == 'Close game!' for c in response.context['comments_by_type']['draw'])
        )

    def test_gamehome_view_with_move_posts(self):
        response = self.client.post(reverse('gamehome:profile'), {
            'message_type': 'move',
            'comment_text': 'Great move!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberMovePost.objects.filter(user=self.user, movepost='Great move!').exists())
        self.assertIn('comments_by_type', response.context)
        self.assertIn('move', response.context['comments_by_type'])
        self.assertTrue(
            any(c['text'] == 'Great move!' for c in response.context['comments_by_type']['move'])
        )
