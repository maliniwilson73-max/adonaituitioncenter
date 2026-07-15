from flask import Flask, g, render_template, request, redirect, url_for
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'db.sqlite3')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'change-this-secret'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


def init_db():
    db = get_db()
    db.execute(
        'CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, phone TEXT)'
    )
    db.execute(
        'CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT)'
    )
    db.execute(
        'CREATE TABLE IF NOT EXISTS enrollments (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, course_id INTEGER NOT NULL, FOREIGN KEY(student_id) REFERENCES students(id), FOREIGN KEY(course_id) REFERENCES courses(id))'
    )
    db.commit()


@app.before_request
def before_request():
    get_db()


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/students')
def students():
    db = get_db()
    rows = db.execute('SELECT * FROM students ORDER BY name').fetchall()
    return render_template('students.html', students=rows)


@app.route('/students/add', methods=['GET', 'POST'])
def add_student():
    if request.method == 'POST':
        name = request.form['name'].strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        if name:
            db = get_db()
            db.execute('INSERT INTO students (name, email, phone) VALUES (?, ?, ?)', (name, email, phone))
            db.commit()
            return redirect(url_for('students'))
    return render_template('add_student.html')


@app.route('/students/<int:student_id>/delete', methods=['POST'])
def delete_student(student_id):
    db = get_db()
    db.execute('DELETE FROM enrollments WHERE student_id = ?', (student_id,))
    db.execute('DELETE FROM students WHERE id = ?', (student_id,))
    db.commit()
    return redirect(url_for('students'))


@app.route('/courses')
def courses():
    db = get_db()
    rows = db.execute('SELECT * FROM courses ORDER BY title').fetchall()
    return render_template('courses.html', courses=rows)


@app.route('/courses/add', methods=['GET', 'POST'])
def add_course():
    if request.method == 'POST':
        title = request.form['title'].strip()
        description = request.form.get('description', '').strip()
        if title:
            db = get_db()
            db.execute('INSERT INTO courses (title, description) VALUES (?, ?)', (title, description))
            db.commit()
            return redirect(url_for('courses'))
    return render_template('add_course.html')


@app.route('/enrollments')
def enrollments():
    db = get_db()
    students = db.execute('SELECT * FROM students ORDER BY name').fetchall()
    courses = db.execute('SELECT * FROM courses ORDER BY title').fetchall()
    rows = db.execute(
        'SELECT enrollments.id, students.name AS student_name, courses.title AS course_title FROM enrollments '
        'JOIN students ON enrollments.student_id = students.id '
        'JOIN courses ON enrollments.course_id = courses.id '
        'ORDER BY students.name'
    ).fetchall()
    return render_template('enrollments.html', students=students, courses=courses, enrollments=rows)


@app.route('/enrollments/add', methods=['POST'])
def add_enrollment():
    student_id = request.form.get('student_id')
    course_id = request.form.get('course_id')
    if student_id and course_id:
        db = get_db()
        existing = db.execute('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', (student_id, course_id)).fetchone()
        if not existing:
            db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', (student_id, course_id))
            db.commit()
    return redirect(url_for('enrollments'))


@app.route('/enrollments/<int:enrollment_id>/delete', methods=['POST'])
def delete_enrollment(enrollment_id):
    db = get_db()
    db.execute('DELETE FROM enrollments WHERE id = ?', (enrollment_id,))
    db.commit()
    return redirect(url_for('enrollments'))


# Initialize the database on startup (needed for production/Render)
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
