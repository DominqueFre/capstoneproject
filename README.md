# Capstone Project

## Table of Contents
-[Introduction](#introduction)
-[Initial steps for setup and deployment](#initial-steps-for-setup-and-deployment)
    -[Steps for Django Framework setup](#steps-for-django-framework-setup)
    -[Steps for deployment](#steps-for-deployment) 
-[Learning Objectives](#learning-objectives)
-[AI Usage](#ai-usage)
-[Supporting documentation](#supporting-documentation)
-[Sources](#sources)

# Introduction
    This project is a simple noughts and crosses game, with interactive features for the user to enjoy and to stimulate continued gameplay and interactions.  The game is playable and the leaderboard can be viewed without login but additional features are accessible if they do so.  Once registered and logged in, gmaeplay results are recorded and the users own score can be viewed on the leaderboard.  The user is able to access, additional levels of play , different themes, enter and save their own gamer name, upload their own avatar for play and create, read, update and delete their own win/play/draw and lose messages.  These are accessed through registering and when logged in they can gain access to further features by achieving certain levels of proficiency. Gameplay and screens are streamlined , with as few unnecessary visual and textual cues as possible to give an uncluttered screen, so the theme and gameplay are the primary impression given to user.

# Initial steps for setup and deployment
## Steps for Django Framework setup
    Select python version and the appropriate versions of other apps...
- Start a venv 
    `python -m venv .venv`
- Install python version required 
- Create 
- -a .python-version file
    input version only eg. 3.12
- -a env.py file 
    to include SECRET_KEY and DATABASE_URL
- -a .gitignore 
    to include env.py and .venv
- -a Procfile  
used in conjunction with gunicorn and Heroku to launch web wsgi processes.
activate the venv
    `source .venv/Scripts/activate`

**Install**
`pip install jjjjj~=1.23.0`
- Django              (framework)
    - (also installs asgiref, tzdata, sqlparse)
- psycopg2            (postgresql database)
    - (also installs setuptools)
- dj-database-url     (postgresql database)
- gunicorn            (web launcher heroku)
- django-summernote   (adds functionality eg filtering capability)
    (also installs webencodings and bleach)
- whitenoise          (static files)
- django-allauth      (user login)
    - (also installs many other apps ie cryptography etc.)
- django-crispy-forms
- crispy-bootstrap5
- cloudinary          (to store user images)
- dj3-cloudinary-storage
- urllib3             (~=1.26.20 to run with cloudinary - overwrites previous))
- setuptools          (~=80.0.0 to run with  - overwrites venv version 70 )

- Create a requirements.txt file
    `pip freeze --local >requirements .txt`

### Steps for creating project 
- Create a project
    `django.admin start project xxx`
- Create apps
    `python manage.py startapp yyy`
- Include in Installed apps
- Create a view
- Include in URL's

### Steps for setting up django's key safely
- As the env.py file is in the gitignore file this can securely hold the keys 
- In the projects settings.py file


- In the env.py file


### Steps for setting up database URL safely
- In the projects settings.py file - utilising the imported env from the key.
    `DATABASES = {'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))}`
- In the env.py file
`import os`

`os.environ.setdefault('DATABASE_URL',"postgresql://etc")`

### Steps for database information     

Inside settings under the database information (this is similar to allowed hosts...)
`CSRF_TRUSTED_ORIGINS = ["https://*.codeinstitute-ide.net/","https://*.herokuapp.com"]`

### Steps for completing the installation of summernote
In the projects settings.py file - in INSTALLED APPS
    `django_summernote`
- In the projects urls.py file - add the path
    `path('summernote/', include('django_summernote.urls)),`
- In the admin.py file  - of the app that will use summernote add the import 
    `from django_summernote.admin import SummernoteModelAdmin`
- Then in the same file add a decorator and class 
(replaces a simple registration eg admin.site.register(ModelClassName))
`@admin.register(ModelClassName)`
`class PostAdmin(SummernoteModelAdmin):`
    `list_display = ('aaaaa', 'slug', 'status')`
    `search_fields = ['aaaaa']`
    `list_filter = ('status',)`
    `prepopulated_fields = {'slug': ('aaaaa',)}`
    `summernote_fields = ('content',)`
- Apply the migrations for the django_summernote app
`python manage.py migrate`



### Steps for completing the installation of Whitenoise tbc
In settings.py file in Middleware after the security middleware add
    `'whitenoise.middleware.WhiteNoiseMiddleware',`
Once installed and when a production deploy is planned run 
    `python manage.py collectstatic`

### Steps for completing installation of django-allauth
- In installed apps(For controlled user login's etc without accessing admin)
    `'django.contrib.sites',` below djoango apps
    `'allauth',`  above project apps
    `'allauth.account',`
    `'allauth.socialaccount',`
- Below the installed apps list and above middleware - add
`SITE_ID = 1`
`LOGIN_REDIRECT_URL = '/'`
`LOGOUT_REDIRECT_URL = '/'`
- To the end of middleware add
`'allauth.account.middleware.AccountMiddleware',`
- Below AUTH_PASSWORD_VALIDATORS add
`ACCOUNT_EMAIL_VERIFICATION = 'none'`
- Now migration is possible
`python manage.py makemigrations`
`python manage.py migrate`
- In the project urls.py file in alphabetical order add
`path("accounts/", include("allauth.urls")),`
- In the base.html file within the templates directory at the top but under the page links add
`{% url 'account_login' as login_url %}`
`{% url 'account_signup' as signup_url %}`
`{% url 'account_logout' as logout_url %}`
and also the associated links as nav bar items
  see base.html file
`pip show django-allauth`
- From the information shown take the <Location> ensuring slashes are forward facing and run the following command
`cp -r <Location>/allauth/templates/* ./templates/`
- This takes a copy of the html for the access screens so that they can be tweaked to use the base.html and it's styles.


### Steps for completing the installation of - django-crispy-forms and crispy-bootstrap - due to use of Bootstrap
- Add in installed apps
    `'crispy_forms',`
    `'crispy_bootstrap5',`
- Additional constants for settings.py file
`CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"`
`CRISPY_TEMPLATE_PACK = "bootstrap5"`

- In the app that will use the form
add a forms.py file
`from .models import NameOfModel`
`from django import forms`

`class NameOfModelForm(forms.ModelForm):`
    `class Meta:`
        `model = NameOfModel`
        `fields = ('body',)`
- In the views.py file
`from .forms import NameOfModelForm`
- Then in the views.py file function that renders the page where the comment field will sit...

In any html template that will house a form
`{% load crispy_forms_tags %}`
Displaying a confirmation message

### Steps for completing the installation of Cloudinary
- In installed apps below staticfiles add 
`'cloudinary_storage',`
- Below django_summernotes add
`'cloudinary',`
- In env.py set the default cloudinary URL and also set this in your deployment platform ie Heroku, 
`os.environ.setdefault(`
`    'CLOUDINARY_URL',`
`    'cloudinary://<key>:<secret>@dnfsa35yv'`
`)`
- Also in this case  key, secret, cloud and a file preset are stored separately, a folder name also has to be selected to send the data across to cloudinary as well as a name for it to be stored against in the database.

### Models /Views / Templates and URL's
**Models**
(The database bit)
- Create models in apps in models.py
- Once created use manage.py
    `python manage.py makemigrations yyy`
    `python manage.py migrate yyy`
- Inside yyy/admin.py - register the model(s)
    `from .models import zzz`
    `admin.site.register(zzz)`
**Views**
- The information pulled out in the format required, additionally processed as equired.

**Templates**
- Base html file in appyyy/templates/appyyy
imports urls that use it at the top
useful for navbars - there are several different ways these can be setup - ensure that the settings in settings.py correspond.
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













## Learning Objectives
Points of note  - rename this to Project working notes and learnings or similar ...
LO1 -  Very few changes were required to the designed ERD  - additional items were used due to adding additional layer of securtiy for Cloudinary images and not having used Cloudinary before not being fully aware of the requirements.  
Only one theme was shown throughout the wireframes, as each theme is essentially the same.  This was a time-saving decision as it would have in essence been duplication of work.




A mixture of CRUD features have been included in the project, standard functionality with clear messaging is used in the User's ability to add their own comments for use in gameplay and slightly less standard functionality with onscreen visual cues to indicate success for avatar upload and selection. 

The navigation login bar provides a visual clue as to login status when on display and if a superuser is logged in they have an addtional link to take them directly to the admin page. Additonal interactive content on the pages indicate logged in status such as the user or gamer name, if one has been chosen, apparent in several places such as the scoreboard, the game comments and in the profile page introduction. 

L04 Testing manual etc  Testing of features has been done manually and has acted as a sense-check that all is working correctly.

Regular Github commits were made, and consideration of data security through use of env.py in conjunction with a gitignore file, with keys then set up in the configuration files of Heroku for hosting.  Debug was set to False for the production environment through judicious use of code and the env.py file.

The application successfully deployed in Heroku.

The application contains a unique data model not previously seen in the course based on the requirements of the project.  

## AI Usage
I used AI at many points throughout the project from image generation, to talking to the Cloudinary chat bot and mainly using Copilot in chats and for inline coding changes.  I regard it as a useful tool but did come across some limitations - being aware of these allows some work arounds.  It appears to have an issue with {% endblock %} if they do not have the title in the endblock , there was a near miss where it suggested deleting code that had been overwritten without considering what had been overwritten. It can be very literal on occasion. It is great at getting things started when there is a very specific list or with tasks that have well-defined parameters.  


## Supporting Documentation

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

* Users must maintain a score within that meets the criteria or they will lose their status.

Wireframes

- [Homescreen Wireframes](doccsupport/wireframes/wfhome.png)
- [Profilescreen Wireframes](docsupport/wireframes/wfprofile.png)
- [Scores Wireframes](docssupport/wireframes/wfscores.png)

ERD
- [Entity Relationship Diagram](doccsupport/erds/capstone-erd.svg)

 
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
|Image Storage|Cloudinairy|Also used AI chatbot|User avatar|
|Database|PostGresSQL|||
|Framework|Django|||
|Image Editing|Microsft Photos|AI image background removal and editing||
|||||
|AI|Copilot|Use for coding, suggestions,queries||
|||||
|HTML||Code Checkers||
|Python||Code Linters||
|CSS||Code Checkers||
|JavaScript||Code Checkers||
|||||



Add tests / manual checking


