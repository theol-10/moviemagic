from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests

app = Flask(__name__)

# TMDb API Key
TMDB_API_KEY = '5afe92b28bb338c8be9a6eaf5f68834b'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Movie suggestions route
@app.route('/get-movie', methods=['POST'])
def get_movie():
    # Get filters from the form
    genre = request.form.get('genre')
    rating = request.form.get('rating')
    year = request.form.get('year')
    runtime = request.form.get('runtime')

    # Build the query for TMDb API
    url = f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&language=en-US"
    
    if genre:
        url += f"&with_genres={genre}"
    if rating:
        url += f"&vote_average.gte={rating}"
    if year:
        url += f"&primary_release_year={year}"
    if runtime:
        url += f"&runtime={runtime}"

    # Fetch movie data
    response = requests.get(url)
    movies = response.json()['results']

    if movies:
        # Select a random movie from the filtered list
        movie = movies[0]  # You can randomly pick a movie here
        return render_template('movie.html', movie=movie)
    else:
        return render_template('index.html', message="No movies found with the given filters.")

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
