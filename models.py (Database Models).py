from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'admin'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('StudentProfile', backref='user', uselist=False)
    preferences = db.relationship('RoommatePreference', backref='user', uselist=False)
    sent_requests = db.relationship('MatchRequest', foreign_keys='MatchRequest.sender_id', backref='sender')
    received_requests = db.relationship('MatchRequest', foreign_keys='MatchRequest.receiver_id', backref='receiver')
    applications = db.relationship('HousingApplication', backref='applicant')
    agreements = db.relationship('Agreement', backref='student')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    university = db.Column(db.String(100))
    course = db.Column(db.String(100))
    year_of_study = db.Column(db.Integer)
    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(200))
    
class RoommatePreference(db.Model):
    __tablename__ = 'roommate_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    preferred_gender = db.Column(db.String(20))
    sleep_schedule = db.Column(db.String(50))  # Early bird, Night owl, Flexible
    study_habits = db.Column(db.String(50))  # Quiet, Moderate, Social
    cleanliness = db.Column(db.Integer)  # 1-5 scale
    guest_policy = db.Column(db.String(50))  # Never, Occasionally, Frequently
    smoking = db.Column(db.Boolean, default=False)
    drinking = db.Column(db.Boolean, default=False)
    pets = db.Column(db.Boolean, default=False)
    budget_min = db.Column(db.Float)
    budget_max = db.Column(db.Float)
    preferred_areas = db.Column(db.String(200))  # Comma-separated
    additional_notes = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MatchRequest(db.Model):
    __tablename__ = 'match_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    compatibility_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('sender_id', 'receiver_id', name='unique_match'),)

class HousingListing(db.Model):
    __tablename__ = 'housing_listings'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    price = db.Column(db.Float)
    bedrooms = db.Column(db.Integer)
    bathrooms = db.Column(db.Float)
    available_from = db.Column(db.Date)
    available_until = db.Column(db.Date)
    is_available = db.Column(db.Boolean, default=True)
    amenities = db.Column(db.String(500))  # Comma-separated
    images = db.Column(db.String(1000))  # Comma-separated URLs
    landlord_name = db.Column(db.String(100))
    landlord_contact = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('HousingApplication', backref='listing')

class HousingApplication(db.Model):
    __tablename__ = 'housing_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('housing_listings.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected, confirmed
    message = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # If confirmed, link to agreement
    agreement = db.relationship('Agreement', backref='application', uselist=False)

class Agreement(db.Model):
    __tablename__ = 'agreements'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('housing_applications.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    signed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    type = db.Column(db.String(50))  # match_request, application_update, agreement, etc.
    title = db.Column(db.String(200))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    related_id = db.Column(db.Integer)  # ID of related entity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)