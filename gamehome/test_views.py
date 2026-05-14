from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from .models import MemberAvatar, MemberChoice, GameScore, MemberWinPost, MemberLosePost, MemberDrawPost

# Create your tests here. AI generated test cases for views in gamehome/views.py


class GameHomeViewAccessTest(TestCase):
    def test_gamehome_view_login_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        login_url = reverse('login')
        self.assertContains(response, login_url)

    def test_gamehome_view_nologout_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        logout_url = reverse('logout')
        self.assertNotContains(response, logout_url)

    def test_gamehome_view_signup_link_for_anonymous(self):
        response = self.client.get(reverse('gamehome:home'))
        signup_url = reverse('signup')
        self.assertContains(response, signup_url)


class GameHomeViewAvatarUploadTest(TestCase):
    def setUpa(self):
        self.usera = User.objects.create_user(username='testusera', password='testpassa', email='testusera@example.com')
        self.client.login(username='testusera', password='testpassa', email='testusera@example.com')

    def test_avatar_upload(self):
        with open('path/to/test/avatar.png', 'rb') as avatar_file:
            response = self.client.post(reverse('gamehome:home'), {
                'avatar_image': avatar_file
            })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberAvatar.objects.filter(user=self.usera).exists())


class GameHomeViewChoiceTest(TestCase):
    def setUp(self):
        self.userc = User.objects.create_user(username='testuserc', password='testpassc', email='testuserc@example.com')
        self.client.login(username='testuserc', password='testpassc', email='testuserc@example.com')

    def test_valid_choice_submission(self):
        response = self.client.post(reverse('gamehome:home'), {
            'choice': 'option1'
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(MemberChoice.objects.filter(user=self.userc, choice='option1').exists())

    def test_invalid_choice_submission(self):
        response = self.client.post(reverse('gamehome:home'), {
            'choice': 'invalid_option'
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(MemberChoice.objects.filter(user=self.userc, choice='invalid_option').exists())


class GameHomeViewPostTest(TestCase):
    def setUp(self):
        self.userp = User.objects.create_user(username='testuserp', password='testpassp', email='testuserp@example.com')
        self.client.login(username='testuserp', password='testpassp', email='testuserp@example.com')

    def test_post_win_comment(self):
        count_before = MemberWinPost.objects.filter(user=self.userp).count()
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'win',
            'comment_text': 'Great game!',
            'comment_id': 1
        })
        count_after = MemberWinPost.objects.filter(user=self.userp).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberWinPost.objects.filter(user=self.userp, winpost='Great game!').exists())

    def test_post_lose_comment(self):
        count_before = MemberLosePost.objects.filter(user=self.userp).count()
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'lose',
            'comment_text': 'Tough loss!',
            'comment_id': 2
        })
        count_after = MemberLosePost.objects.filter(user=self.userp).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberLosePost.objects.filter(user=self.userp, losepost='Tough loss!').exists())

    def test_post_draw_comment(self):
        count_before = MemberDrawPost.objects.filter(user=self.userp).count()
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'draw',
            'comment_text': 'Close game!',
            'comment_id': 3
        })
        count_after = MemberDrawPost.objects.filter(user=self.userp).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(MemberDrawPost.objects.filter(user=self.userp, drawpost='Close game!').exists())

    def test_post_invalid_message_type(self):
        count_before = MemberWinPost.objects.filter(user=self.userp).count()
        response = self.client.post(reverse('gamehome:home'), {
            'message_type': 'invalid',
            'comment_text': 'This should not work.',
            'comment_id': 4
        })
        count_after = MemberWinPost.objects.filter(user=self.userp).count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(count_after, count_before)
        self.assertFalse(MemberWinPost.objects.filter(user=self.userp, winpost='This should not work.').exists())
        self.assertFalse(MemberLosePost.objects.filter(user=self.userp, losepost='This should not work.').exists())
        self.assertFalse(MemberDrawPost.objects.filter(user=self.userp, drawpost='This should not work.').exists())


class GameHomeViewTest(TestCase):
    def setUp(self):
        self.usert = User.objects.create_user(
            username='testusert',
            password='testpasst',
            email='testusert@example.com'
            )
        self.client.login(username='testusert', password='testpasst', email='testusert@example.com')

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
        self.assertTemplateUsed(response, 'gamehome/gamehome.html')

    def test_gamehome_view_context(self):
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('member_info', response.context)
        self.assertIn('recent_scores', response.context)
        self.assertIn('win_posts', response.context)
        self.assertIn('lose_posts', response.context)
        self.assertIn('draw_posts', response.context)
        self.assertIn('avatar_form', response.context)
        self.assertIn('comment_form', response.context)
        self.assertIn('choice_form', response.context)
        self.assertIn('avatar_url', response.context)
        # Additional assertions can be added here to check the content of the context variables if needed.

    def test_gamehome_view_with_scores(self):
        GameScore.objects.create(user=self.user, difficulty='easy', outcome='W')
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('recent_scores', response.context)
        self.assertEqual(len(response.context['recent_scores']), 1)
        self.assertEqual(response.context['recent_scores'][0].outcome, 'W')

    def test_gamehome_view_with_win_posts(self):
        MemberWinPost.objects.create(user=self.user, winpost='Great win!')
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('win_posts', response.context)
        self.assertEqual(len(response.context['win_posts']), 1)
        self.assertEqual(response.context['win_posts'][0].winpost, 'Great win!')

    def test_gamehome_view_with_lose_posts(self):
        MemberLosePost.objects.create(user=self.user, losepost='Tough loss!')
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('lose_posts', response.context)
        self.assertEqual(len(response.context['lose_posts']), 1)
        self.assertEqual(response.context['lose_posts'][0].losepost, 'Tough loss!')

    def test_gamehome_view_with_draw_posts(self):
        MemberDrawPost.objects.create(user=self.user, drawpost='Close game!')
        response = self.client.get(reverse('gamehome:home'))
        self.assertIn('draw_posts', response.context)
        self.assertEqual(len(response.context['draw_posts']), 1)
        self.assertEqual(response.context['draw_posts'][0].drawpost, 'Close game!')
