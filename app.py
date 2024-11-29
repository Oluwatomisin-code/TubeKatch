from flask import Flask, render_template,request, jsonify, Response,send_file
import yt_dlp
from io import BytesIO
import subprocess
import os
import ffmpeg
# from pytube import YouTube


app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')


# Helper function to fetch video details
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
        print(info_dict, '\n')
        if(f.get('format_note')):
            #formatting data for mp4s
            if(f.get('ext')=="mp4"):
                #ensuring we dont return videos that resolutioon is not specified
                if(f.get('height')):
                # Extracting only the necessary details
                    formats.append({
                        'format_id': f['format_id'],
                        'format_note': f.get('format_note'),
                        'ext': f['ext'],
                        'resolution': f.get('height', 'N/A'),
                        'filesize': f.get('filesize', 'N/A'),
                        'url': f.get('url', None),  # Only include direct URL for later download
                        'acodec': f.get('acodec', 'N/A')  # Add audio codec info (if available)
                    })
             # Extracting only the necessary details
            else:
                if(f.get('ext')!="mhtml"):  
                    formats.append({
                        'format_id': f['format_id'],
                        'format_note': f.get('format_note'),
                        'ext': f['ext'],
                        'resolution': f.get('height', 'N/A'),
                        'filesize': f.get('filesize', 'N/A'),
                        'url': f.get('url', None),  # Only include direct URL for later download
                        'acodec': f.get('acodec', 'N/A')  # Add audio codec info (if available)
                    })
    


    return {
        'title': info_dict.get('title'),
        'description': info_dict.get('description'),
        'duration':info_dict.get('duration'),
        'thumbnail': info_dict.get('thumbnail'),
        'formats': formats  # List of formats available for download
        
    }


@app.route('/getVideo', methods=['POST'],)
def getVideo():
    videoUrl = request.args.get('videoUrl')

    if videoUrl:
        print(videoUrl, 'right away')

        try:
            # Get the video details using yt-dlp
            video_info = get_video_details(videoUrl)
            return jsonify(video_info),200  # Return the video details in JSON format

        except Exception as e:
            print(str(e), 'error from except block')
            return jsonify({'error': str(e)}), 500
    
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
import ffmpeg

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


if __name__ == '__main__':
    app.run(port=5000)