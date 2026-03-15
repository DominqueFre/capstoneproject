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

Final to do's - add numbering - see if can link if not auto


Non-Negotiable Requirements”.

- The game-play screen should take up the viewport/browser window only - no scrolling should be required of the page itself.  Elements within the page may be scrollable. This effectively limits the size of the gameboard image and game-play area wich is nested within the game-image area. This is to give the best visual impact possible.
- The gameboard image must be fully on screen on all device sizes.
- messages align against 


“Follow the Non-Negotiable Requirements in README before editing.”


Explaining layout expectations
1st run (tweaks such as information panel sizing to be added in next run)
theme-status-bg to be used as the background for the play area game squares

Play screen

border-box sizing used as default 
**Large Device**
Nav bar at top
(a) difficulty-picker button bar       (b) theme-picker button bar 
These appear (a) top left hand side of screen and (b) top right hand of screen 
 
(c) side-status-player  (2.5 columns wide. appears left of screen, margin left and right 10%/0.25 columns)
(d) play-render Game area image and game-board  (6 columns max width, no margin, max height, remaining viewport height after Navbar and picker buttone bars)
(e) side-staus-computer (2.5 columns wide margin left and right 10%/0.25 columns)
(f) Coin plus controls ( 2.5 columns wide margin left and right 10%/0.25 columns defined container size)
 (e) and (f) are in the same column - coin takes up full width - and appears below (e), (e) will take up the remainder of the available height of the column.

**Tablet**
Nav bar at top (to be centred)
(a) difficulty-picker button bar        
(b) theme-picker button bar
These (a/b) appear top left of screen one under the other
(f) Coin plus controls ( 2.5 columns wide top right hand side same height position as the button bars - defined container size required for seamless rendering changes)
(d) play-render Game area image and game-board  (12 columns wide)
The play-render is below the pickers and coin row.
(c) side-status-player  (5.5 columns wide margin left and right 0.25 columns)
(e) side-status-computer (5.5 columns wide margin left and right 0.25 columns)
(c) and (e) appear below the play-render area with (c) to the left and (e) to the right

**Mobile - portrait view**
Collapsed Navbar at top, centred when opened
(a) difficulty-picker button bar        
(a) theme-picker button bar
These (a) are collapsed and appear top left of screen one under the other, when not collapsed.
(f) Coin plus controls ( 2.5 columns wide top right hand side same height position as the button bars - defined container size required for seamless rendering changes)
(d) play-render Game area image and game-board  (12 columns wide)
(c) side-status-player  (9 columns wide)
(e) side status computer (9 columns wide)
(c) and (e) appear below the play-render area with (c) to the left and (e) to the right - a max height will be required to keep this on screen.  