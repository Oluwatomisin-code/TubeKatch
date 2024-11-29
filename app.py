from flask import Flask, render_template,request, jsonify, Response,send_file
import yt_dlp
from io import BytesIO
import subprocess
import os
import ffmpeg
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time


app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')


    
def download_video_by_format(url,format_id, download_path='downloads/video.mp4'):
    """Download video using yt-dlp."""
    # If format_id is provided, use it. Otherwise, fallback to 'bestvideo+bestaudio'
    if format_id:
        ydl_opts = {
            'format': format_id,  # Use the format_id if available
            'outtmpl': download_path,  # Specify the output file path
            'quiet': True,  # Disable output to the console
            'merge_output_format': 'mp4',
        }
    else:
        # Fallback to 'bestvideo+bestaudio' if format_id is not provided
        ydl_opts = {
            'format': 'bestvideo+bestaudio',  # Best video and audio streams combined
            'outtmpl': download_path,  # Specify the output file path
            'quiet': True,  # Disable output to the console
            'merge_output_format': 'mp4',
        }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

# def manipulate_video(input_path, output_path, start_time='00:00:30', end_time='00:01:00', resolution='1280x720'):
#     """Use ffmpeg to manipulate the video (e.g., trim, resize)."""
#     command = [
#         'ffmpeg',
#         '-i', input_path,  # Input file path
#         '-ss', start_time,  # Start time
#         '-to', end_time,  # End time
#         '-vf', f'scale={resolution}',  # Resize video to specified resolution
#         '-c:v', 'libx264',  # Use H.264 video codec
#         '-c:a', 'aac',  # Use AAC audio codec
#         '-strict', 'experimental',  # Enable experimental features if needed
#         output_path  # Output file path
#     ]
    
#     try:
#         # Run the ffmpeg command
#         subprocess.run(command, check=True)
#         print(f"Video manipulated successfully: {output_path}")
#     except subprocess.CalledProcessError as e:
#         print(f"Error during video manipulation: {e}")


def manipulate_video(input_path, output_path, start_time='00:00:30', end_time='00:01:00', resolution='1280x720'):
    """Use ffmpeg-python to manipulate the video (e.g., trim, resize)."""
    try:
        # ffmpeg command using ffmpeg-python
        ffmpeg.input(input_path, ss=start_time, to=end_time) \
            .output(output_path, vf=f'scale={resolution}', vcodec='libx264', acodec='aac', strict='experimental') \
            .run()
        
        print(f"Video manipulated successfully: {output_path}")
    except ffmpeg.Error as e:
        print(f"Error during video manipulation: {e.stderr.decode()}")


@app.route("/download", methods=['GET'])
def download():
    """Handle video download, manipulation, and send back to the user."""
    
    # Get video URL and quality format from query parameters
    video_url = request.args.get('videoUrl')
    itag = request.args.get('itag')  # This should be the format ID that the user selects
    format_id = request.args.get('format_id')  # Optional: Use format_id for more control
    start = request.args.get('str')  # Optional: Use format_id for more control
    end = request.args.get('end')  # Optional: Use format_id for more control
    
    print(start, end)
    if not video_url:
        return jsonify({"error": "Missing video URL"}), 400
    
    # Define paths for downloaded and manipulated video
    download_path = 'downloads/video.mp4'
    manipulated_video_path = 'downloads/manipulated_video.mp4'

    # Download the video
    try:
        download_video_by_format(video_url,format_id, download_path )
    except Exception as e:
        return jsonify({"error": "Failed to download video", "message": str(e)}), 500
    
    # Manipulate the video (you can customize this part)
    try:
        manipulate_video(download_path, manipulated_video_path, start_time=start, end_time=end, resolution='1280x720')
    except Exception as e:
        return jsonify({"error": "Failed to manipulate video", "message": str(e)}), 500
    
    # Send the manipulated video back to the user
    try:
        return send_file(manipulated_video_path, as_attachment=True, download_name='manipulated_video.mp4')
    except Exception as e:
        return jsonify({"error": "Failed to send the manipulated video", "message": str(e)}), 500

# Helper function to fetch video details using yt-dlp
def get_video_details(url):
    # Options to make sure yt-dlp returns the best info without downloading
    ydl_opts = {
        'quiet': True,  # Suppress yt-dlp output
        'format': 'bestaudio/bestvideo',  # Will get best audio/video options
        'noplaylist': True,  # Don't download playlists, just the video
        'nocheckcertificate': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=False)  # Don't download, just get info

    # Format the response to return useful information
    formats = []
    for f in info_dict.get('formats', []):
        if f.get('format_note'):
            # Formatting data for mp4s
            if f.get('ext') == "mp4":
                if f.get('height'):
                    formats.append({
                        'format_id': f['format_id'],
                        'format_note': f.get('format_note'),
                        'ext': f['ext'],
                        'resolution': f.get('height', 'N/A'),
                        'filesize': f.get('filesize', 'N/A'),
                        'url': f.get('url', None),
                        'acodec': f.get('acodec', 'N/A')
                    })
            else:
                if f.get('ext') != "mhtml":
                    formats.append({
                        'format_id': f['format_id'],
                        'format_note': f.get('format_note'),
                        'ext': f['ext'],
                        'resolution': f.get('height', 'N/A'),
                        'filesize': f.get('filesize', 'N/A'),
                        'url': f.get('url', None),
                        'acodec': f.get('acodec', 'N/A')
                    })

    return {
        'title': info_dict.get('title'),
        'description': info_dict.get('description'),
        'duration': info_dict.get('duration'),
        'thumbnail': info_dict.get('thumbnail'),
        'formats': formats
    }

# Function to load the YouTube video page in a headless browser (using Selenium)
def get_video_url_from_selenium(url):
    # Initialize the headless browser (Chrome)
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no UI)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Path to ChromeDriver (adjust if needed)
    driver = webdriver.Chrome(options=chrome_options)

    try:
        # Open the YouTube video page
        driver.get(url)
        time.sleep(30)  # Wait for the page to load properly (you may need to adjust timing)

        # Return the final URL after loading the page
        final_url = driver.current_url
        driver.quit()  # Close the browser

        return final_url
    except Exception as e:
        driver.quit()  # Ensure the browser is closed if an error occurs
        raise Exception(f"Error loading the YouTube page: {str(e)}")

@app.route('/getVideo', methods=['POST'])
def get_video():
    # Get the YouTube URL from the frontend request
    videoUrl = request.args.get('videoUrl')

    if videoUrl:
        try:
            # Step 1: Use Selenium to bypass bot detection and fetch the video URL
            final_video_url = get_video_url_from_selenium(videoUrl)

            # Step 2: Get video details using yt-dlp with the final URL from Selenium
            video_info = get_video_details(final_video_url)

            # Return the video details as a JSON response
            return jsonify(video_info), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'No video URL provided'}), 400
if __name__ == '__main__':
    app.run(port=5000)