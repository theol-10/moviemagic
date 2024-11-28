from flask import Flask, render_template, redirect, url_for, request, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from models import db, User
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import InputRequired, Email, Length

app = Flask(__name__)

# Configure the app
app.config['SECRET_KEY'] = 'mysecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database and Flask extensions
db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'  # Redirect to login page if user is not authenticated

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create User Registration Form (using Flask-WTF)
class RegisterForm(FlaskForm):
    email = StringField('Email', validators=[InputRequired(), Email(), Length(min=4, max=100)])
    password = PasswordField('Password', validators=[InputRequired(), Length(min=6)])

# Create User Login Form
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])

# Registration route
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        new_user = User(email=form.email.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful!', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Login failed. Check your email or password.', 'danger')
    return render_template('login.html', form=form)

# Logout route
@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out!', 'info')
    return redirect(url_for('login'))

# Movie Picker Route (only accessible to logged-in users)
@app.route('/')
@login_required
def home():
    # Render the movie picker page only for logged-in users
    return render_template('index.html')

# Initialize the database and run the app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create all database tables
    app.run(debug=True)
