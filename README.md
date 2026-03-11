# Capstone Project

## Index
1. Steps for Django setup
2. Steps for deployment 
3. 
4. AI Usage 
5. Supporting documentation
6. Sources

Initial steps for setup and deployment


## Steps for Django project setup
    Select python version and the appropriate versions of other apps...
-Start a venv 
    `python -m venv .venv`
-Install python version required 
-Create 
--a .python-version file
    input version only eg. 3.12
--a env.py file 
    to include SECRET_KEY and DATABASE_URL
--a .gitignore 
    to include env.py and .venv
--a Procfile  
used in conjunction with gunicorn and Heroku to launch web wsgi processes.
activate the venv
    .venv/Scripts/activate

**Install**
`pip install jjjjj~=1.23.0`
Django              (framework)
    (also installs asgiref, tzdata, sqlparse)
psycopg2            (postgresql database)
    (also installs setuptools)
dj-database-url     (postgresql database)
gunicorn            (web launcher heroku)
django-summernote   (adds functionality eg filtering capability)
    (also installs webencodings and bleach)
whitenoise          (hmmm CSS, images )
django-allauth      (user login)
    (also installs many other apps ie cryptography etc.)
django-crispy-forms
crispy-bootstrap5
cloudinary          (to store user images and content)
dj3-cloudinary-storage
urllib3             (~=1.26.20 to run with cloudinary - overwrites previous))
setuptools          (~=80.0.0 to run with  - overwrites venv version 70 )

Create a requirements.txt file
    `pip freeze --local >requirements .txt`

### Steps for creating project 
Create a project
    `django.admin start project xxx`
Create apps
    `python manage.py startapp yyy`
Include in Installed apps
Create a view
Include in URL's

### Steps for setting up django's key safely
In the projects settings.py file


In the env.py file


### Steps for setting up database URL safely
In the projects settings.py file - utilising the imported env from the key.
    `DATABASES = {'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))}`
In the env.py file
`import os`

`os.environ.setdefault('DATABASE_URL',"postgresql://etc")`

### Steps for database information     

Inside settings under the database information (this is similar to allowed hosts...)
`CSRF_TRUSTED_ORIGINS = ["https://*.codeinstitute-ide.net/","https://*.herokuapp.com"]`

### Steps for completing the installation of summernote
In the projects settings.py file - in INSTALLED APPS
    `django_summernote`
In the projects urls.py file - add the path
    `path('summernote/', include('django_summernote.urls)),`
In the admin.py file  - of the app that will use summernote add the import 
    `from django_summernote.admin import SummernoteModelAdmin`
Then in the same file add a decorator and class 
(replaces a simple registration eg admin.site.register(ModelClassName))
`@admin.register(ModelClassName)`
`class PostAdmin(SummernoteModelAdmin):`
    `list_display = ('aaaaa', 'slug', 'status')`
    `search_fields = ['aaaaa']`
    `list_filter = ('status',)`
    `prepopulated_fields = {'slug': ('aaaaa',)}`
    `summernote_fields = ('content',)`
Apply the migrations for the django_summernote app
`python manage.py migrate`



### Steps for completing the installation of Whitenoise tbc
In settings.py file in Middleware after the security middleware add
    `'whitenoise.middleware.WhiteNoiseMiddleware',`
Once installed and when a production deploy is planned run 
    `python manage.py collectstatic`

### Steps for completing installation of django-allauth
In installed apps(For controlled user login's etc without accessing admin)
    `'django.contrib.sites',` below djoango apps
    `'allauth',`  above project apps
    `'allauth.account',`
    `'allauth.socialaccount',`
and below the installed apps list and above middleware - add
`SITE_ID = 1`
`LOGIN_REDIRECT_URL = '/'`
`LOGOUT_REDIRECT_URL = '/'`
and to the end of middleware add
`'allauth.account.middleware.AccountMiddleware',`
and below AUTH_PASSWORD_VALIDATORS add
`ACCOUNT_EMAIL_VERIFICATION = 'none'`
now migration is possible
`python manage.py migrate`
then in the project urls.py file in alphabetical order add
`path("accounts/", include("allauth.urls")),`
in the base.html file within the templates directory at the top but under the page links add
`{% url 'account_login' as login_url %}`
`{% url 'account_signup' as signup_url %}`
`{% url 'account_logout' as logout_url %}`
and the associated links as nav bar items
  see base.html file
`pip show django-allauth`
from the information shown take the <Location> ensuring slashes are forward facing and run the following command
`cp -r <Location>/allauth/templates/* ./templates/`
This takes a copy of the html for the access screens so that they can be tweaked.
login.html
logout.html
signup,html

### Steps for completing the installation of - django-crispy-forms and crispy-bootstrap - due to use of Bootstrap
Add in installed apps
    `'crispy_forms',`
    `'crispy_bootstrap5',`
Additional constants for settings.py file
`CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"`
`CRISPY_TEMPLATE_PACK = "bootstrap5"`

In the app that will use the form
add a forms.py file
`from .models import NameOfModel`
`from django import forms`

`class NameOfModelForm(forms.ModelForm):`
    `class Meta:`
        `model = NameOfModel`
        `fields = ('body',)`
In the views.py file
`from .forms import NameOfModelForm`
then in the views.py file function that renders the page where the comment field will sit...

In any html template that will house a form
`{% load crispy_forms_tags %}`
Displaying a confirmation message

### Steps for completing the installation of Cloudinary
in installed apps below staticfiles add 
`'cloudinary_storage',`
and below django_summernotes add
`'cloudinary',`
in env.py set the default cloudinary URL and also set this in your deployment platform ie Heroku
`os.environ.setdefault(`
`    'CLOUDINARY_URL',`
`    'cloudinary://<key>:<secret>@dnfsa35yv'`
`)`


### Models /Views / Templates and URL's
**Models**
(The database bit)
Create models in apps in models.py
Once created use manage.py
    `python manage.py makemigrations yyy`
    `python manage.py migrate yyy`
Inside yyy/admin.py - register the model(s)
    `from .models import zzz`
    `admin.site.register(zzz)`
**Views**
(The information pulled out in the format required)

**Templates**
Base html file in projectxxx/template/ directory
imports urls that use it at the top
useful for navbars
**URLs**
(how we get about)
**Static folder and files**
Java Script , CSS style sheets and images are stored in here.  They do not change and are
part of the project set up.

**staticfiles**
Once required the command below must be run before each commit/deploy
`python manage.py collectstatic`

**Model and View setups**


**Create Super user**
Run the command 
`python manage.py createsuperuser`


_Proposed Django layout_
- Project: game
	- Templates: 
	    - base.html – nav bar, simple footer, various links 
	    - login.html (in template/account/snippets)
	    - logout.html (“”)
	    - signup.html (“”)

- App: gamehome
	- Models
	    - Member_information
	- Views
	    - Member status
    - Template content
	    - Game board
- App: gamescores
	- Models
	    - Gamescores
    - Views
	    - Member_status
	    - Top 20 scores for each difficulty level (highest % non-loss, highest % win)
	    - Member score for each difficulty level @logged_in
	- Template content
	    - Score board

- App: gameprofile
    - Models (import User, Member Information)
        - Win messages (with user-id and win id)
            - Requires input / edit form
        - Lose messages (with user-id and win id)
            - Requires input form
        - Draw messages (with user-id and win id)
            - Requires input form
        - Move messages (with user-id and win id)
            - Requires input form
        - Avatar (Cloudinary image, user-id)
            - Requires input form
        - Avatar selection (user-id, status)
            - Default status is randomise
    - Views
        - Message counts (restricted to 10 per message type)
        - Current messages (Visible and selectable to edit)
        - Image count
        - Current image (player piece visible and can be overridden)
    - Template content
        - Profile Screen
        - Various input modal pop ups




Functionality
Information – the game can be played without logging in, but some functionality is disabled.
---------------------------------------------------
| |Casual User |New Member/Novice |	Seasoned*|	Master*|
|--|--|----|-------------|--|
Member status	|Site access	|Register	|30 games & < 20% L’s	|50 games & < 10% L’s
Display name|No|Yes|Yes|Yes|
Difficulty|	Easy	|Normal	|Hard	|Fiendish
Themes	|Traditional	|Fantasy	|Robots	|Flowers
Game messages	|No	|Yes|As Member|As Member	
Avatar	|No	|No	|Yes	|As Seasoned
Avatar selection	|Default	|Random	|Selection	|As Seasoned
Scores screen	|Yes 	|Own score highlighted	|As Member	|As Member
Scores recorded	|No	|Yes	|As Member	|As Member

*Once status is achieved, can not be lost.

Wireframes

- [Homescreen Wireframes](static/wireframes/wfhome.png)
- [Profilescreen Wireframes](static/wireframes/wfprofile.png)
- [Scores Wireframes](static/wireframes/wfscores.png)

ERD
- [Entity Relationship Diagram](static/erds/capstone-erd.svg)

 
 Sources
 |Item|Source|Usage|Comment|
|--|--|--|--|
|Wireframe|Balsamiq|Screen, tablet and mobile views of main screens||
|ERD|dbdiagram.io|updated sample code||
|||||
|Images|Freepik|AI generated|Altered as required|
|Images|Craiyon|AI generated|Altered as required|
|||||
|Repository|Git Hub|Repository hosting service||
|Hosting Platform|Heroku|Platform hosting service||
|IDE|VSCode|||
|Image Storage|Cloudinairy||User avatar|
|Database|PostGresSQL|||
|Framework|Django|||
|||||

Final to do's - add mubering - see if can link if not auto


// Winning phrases
winningPhrases = [
    "Congratulations! You win!",
    "Well done! You are the champion!",
    "You did it! Victory is yours!",
    "Amazing! You are the winner!",
    "Great job! You have won the game!",
    "Fantastic! You are the master of this game!",
    "You are simply the best.",
    "I look forward to getting the chance to win...sometime!",
    "You're a winning machine.",
    "You're a superstar",
    "You make me a dizzy.",
    "Even the best players lose sometimes.",

];
// Computer phrases when Player 1 Loses
losingPhrases = [
    "Better luck next time! Try again.",
    "Don't give up! Play again to win.",
    "So close! Play again to claim victory.",
    "Keep trying! You'll get it next time.",
    "Don't worry, it's just a game! Play again to win.",
    "Almost had it! Play again to see if you can win this time.",
    "Another day, another flawless victory... for me.",
    "Keep your chin up.",
    "This is just a learning opportunity.",
    "You were a tough adversary.",
    "Losing is part of the game!",
    "You played with your heart.",
];
// Draw phrases
drawPhrases = [
    "It's a draw! Try again.",
    "No winner this time. Play again!",
    "It's a tie! Give it another shot.",
    "Stalemate! Play again to break the tie.",
    "It's a draw! Who will win next time?",
    "What a great game! It's a draw. Try again to see who will win next time.",
    "It's a draw.",
    "Stalemate.",
    "We're on a level pegging.",
    "I'll get you next time.",
    "Room for improvement on both sides.",
    "No losers here!",
    "What a closely fought battle.",
    "Another tie!",
    "A tie!",
    "I'm having such a good time.",
    "I don't want to stop at all.",
];

// General gameplay phrases
generalPhrases = [
    "Your turn! Make your move.",
    "Off you go.",
    "Think carefully! Your move can change the game.",
    "The game is heating up! Make your move.",
    "It's getting intense! Choose your next move wisely.",
    "The board is filling up! Make your move before it's too late.",
    "The game is in full swing! Place your counter!",
    "Every move counts! Choose wisely and see if you can be the smart one.",
    "Time to play!",
    "If only we could both win!",
    "Let's see who comes out on top!",
    "Your move.",
    "I have lots of patience.",
    "This is a tough one to call.",
    "Your go.",
    "I've made my move.",
    "Waiting on you now",
    "Just waiting ...".
    "Done.",
    "Ready.",
    "OK, time to rock on.",
    "It's time to move it, move it.",
    "Push the button.",
    "Don't stop now.",
    "Keep it going,",
    "Be kind.",
    "Don't suppose you fancy letting me win one?",
    "All moves are good moves.",
    "Click away.",
    "The clock is ticking.",
    "The board calls.",
    "Where will you go next?",
    "Go for it.",
    "It's all you.",
    "The ball's in your court.",
    "It's your play now.",
    "Boss calls the shots, you choose your slot.",
    "Bop it.",
    "Es tu turno.",
    "C'est ton tour.",
    "Du bist dran.",
    "E il tuo turno.",
    "Eich tro chi yw hi",
    "I think, therefore I have taken my turn.",
    "One small step for me, a giant step for mankind.",
    "This game is like a box of chocolates.",
    "Actions speak louder than words, take your turn!",
    "To choose or mot to choose ... please choose."
    "Carpe diem",
    "Y.O.L.O.",
    "Break a leg.",
    "Easy, peasy, lemon squeezy.",
    "Don't bite off more than you can chew.",
    "What's your move?",
    "If you win, pigs might fly.",
    "A stitch in time saves nine.",
    "Mind your p's and q's.",
    "Don't throw the baby out with the bath water.",
    
];