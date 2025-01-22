from cmath import exp
from math import radians, pi, cos, sin, sqrt, acos, hypot
import pyperclip
import json

import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

import svg
from svg.path import parse_path, Arc, QuadraticBezier, CubicBezier, Move, Line, Close, Path

def sign(x):
    if x < 0: return -1
    return 1

# Baumans
#PATH = "M 8.902 44.4 L 8.902 70 L 0.002 70 L 0.002 26 Q 0.002 15.2 6.952 7.6 A 22.981 22.981 0 0 1 23.711 0.023 A 30.909 30.909 0 0 1 24.902 0 L 47.802 0 L 47.802 70 L 38.402 70 L 38.402 8.8 L 24.902 8.8 Q 17.602 8.8 13.252 13.1 A 12.922 12.922 0 0 0 10.278 17.839 Q 9.506 19.898 9.167 22.464 A 33.172 33.172 0 0 0 8.902 26.8 L 8.902 35.3 Q 14.234 29.682 23.917 29.414 A 35.474 35.474 0 0 1 24.902 29.4 L 34.002 29.4 L 34.002 38.2 L 24.902 38.2 A 39.54 39.54 0 0 0 21.168 38.365 Q 19.313 38.542 17.747 38.906 A 17.463 17.463 0 0 0 15.452 39.6 A 15.334 15.334 0 0 0 10.604 42.635 A 19.464 19.464 0 0 0 8.902 44.4 Z"
#PATH = "M 0 0 L 5 5 L 10 0"
#PATH = "M 0 0 C 0 4 1 -1 1 3"
#PATH = "M 0 0 A 6 4.5 45 0 0 10 0 A 6 4.5 45 0 1 20 0"
#PATH = "M 50.001 1.301 L 50.001 23.601 L 48.001 23.601 A 24.016 24.016 0 0 0 43.292 9.334 A 29.677 29.677 0 0 0 42.901 8.801 A 16.56 16.56 0 0 0 30.886 2.135 A 24.144 24.144 0 0 0 28.301 2.001 A 8.444 8.444 0 0 0 22.27 4.545 Q 21.114 5.66 20.105 7.264 A 20.17 20.17 0 0 0 19.551 8.201 Q 16.779 13.182 16.234 23.845 A 109.163 109.163 0 0 0 16.101 29.401 Q 16.101 41.056 18.184 47.398 A 18.396 18.396 0 0 0 19.551 50.601 Q 22.596 56.072 28.678 56.715 A 15.917 15.917 0 0 0 30.351 56.801 A 19.426 19.426 0 0 0 36.932 55.722 A 17.14 17.14 0 0 0 42.751 52.201 A 18.403 18.403 0 0 0 47.518 45.075 Q 48.542 42.416 49.001 39.201 L 51.001 39.201 A 33.512 33.512 0 0 1 49.635 45.154 Q 48.507 48.523 46.684 51.049 A 17.203 17.203 0 0 1 44.051 53.951 Q 38.501 58.801 30.801 58.801 A 49.739 49.739 0 0 1 21.969 58.067 Q 13.355 56.511 7.951 51.651 Q 1.354 45.717 0.231 34.206 A 51.097 51.097 0 0 1 0.001 29.251 A 47.474 47.474 0 0 1 0.649 21.124 Q 2.241 11.977 7.751 7.001 A 26.401 26.401 0 0 1 20.055 0.837 A 38.533 38.533 0 0 1 28.301 0.001 A 26.274 26.274 0 0 1 40.07 2.834 A 31.618 31.618 0 0 1 41.701 3.701 A 13.647 13.647 0 0 0 42.808 4.322 Q 43.941 4.884 44.805 4.981 A 3.12 3.12 0 0 0 45.151 5.001 Q 46.501 5.001 47.301 3.751 A 5.654 5.654 0 0 0 47.819 2.743 Q 48.101 2.013 48.101 1.301 L 50.001 1.301 Z"
#PATH = "M 176.8 52.8 L 172.7 52.8 L 172.7 45.1 L 177.5 45.1 Q 182.757 45.1 185.49 43.838 A 6.523 6.523 0 0 0 186.8 43.05 A 6.233 6.233 0 0 0 188.789 40.209 Q 189.171 39.158 189.314 37.855 A 15.158 15.158 0 0 0 189.4 36.2 A 6.597 6.597 0 0 0 189.128 34.252 A 4.933 4.933 0 0 0 187.1 31.55 A 8.623 8.623 0 0 0 184.289 30.341 Q 183.15 30.064 181.823 30.012 A 15.949 15.949 0 0 0 181.2 30 A 16.176 16.176 0 0 0 176.211 30.733 A 12.887 12.887 0 0 0 170.05 35 A 18.12 18.12 0 0 0 166.048 45.493 A 23.122 23.122 0 0 0 166 47 A 20.529 20.529 0 0 0 166.664 52.354 A 15.304 15.304 0 0 0 170.35 59 A 14.504 14.504 0 0 0 179.965 63.526 A 19.866 19.866 0 0 0 181.7 63.6 A 20.962 20.962 0 0 0 186.186 63.146 Q 189.322 62.46 191.688 60.735 A 13.265 13.265 0 0 0 192 60.5 L 198 66.4 A 24.96 24.96 0 0 1 182.285 71.995 A 31.17 31.17 0 0 1 181.7 72 A 31.386 31.386 0 0 1 173.797 71.058 A 22.405 22.405 0 0 1 163.5 65.3 A 22.534 22.534 0 0 1 156.834 50.905 A 30.659 30.659 0 0 1 156.7 48 A 33.829 33.829 0 0 1 157.702 39.547 A 24.512 24.512 0 0 1 163.4 28.9 Q 170.1 21.6 181.7 22 A 31.801 31.801 0 0 1 188.063 22.848 Q 198.7 25.501 198.7 36.1 Q 198.7 52.8 176.8 52.8 Z M 0.755 27.933 A 51.42 51.42 0 0 0 0 36.3 A 53.841 53.841 0 0 0 0.453 42.764 A 41.396 41.396 0 0 0 2.45 51.2 A 36.891 36.891 0 0 0 3.659 54.184 A 30.532 30.532 0 0 0 9.1 62.4 Q 13.4 67 19.45 69.5 A 31.635 31.635 0 0 0 24.795 71.165 A 37.923 37.923 0 0 0 32.9 72 A 40.646 40.646 0 0 0 37.011 71.797 A 33.076 33.076 0 0 0 46.35 69.5 Q 52.4 67 56.7 62.4 A 29.137 29.137 0 0 0 59.762 58.502 A 33.961 33.961 0 0 0 63.35 51.2 A 40.345 40.345 0 0 0 65.099 44.408 A 52.197 52.197 0 0 0 65.8 36.3 A 53.574 53.574 0 0 0 65.402 30.3 A 42.101 42.101 0 0 0 63.3 21.3 Q 60.9 14.6 56.6 9.85 Q 52.3 5.1 46.25 2.55 A 31.201 31.201 0 0 0 41.435 0.972 A 36.318 36.318 0 0 0 32.9 0 A 39.617 39.617 0 0 0 28.63 0.225 A 32.032 32.032 0 0 0 19.5 2.55 Q 13.5 5.1 9.2 9.85 A 31.006 31.006 0 0 0 6.24 13.69 A 36.019 36.019 0 0 0 2.5 21.3 A 40.74 40.74 0 0 0 0.755 27.933 Z M 77.8 52 L 77.8 1 L 86.8 1 L 86.8 52 A 25.026 25.026 0 0 0 86.9 54.316 Q 87.092 56.374 87.65 57.85 A 7.009 7.009 0 0 0 88.478 59.437 A 5.176 5.176 0 0 0 90.3 61.05 A 13.519 13.519 0 0 0 92.184 61.876 A 10.538 10.538 0 0 0 93.8 62.3 Q 95.5 62.6 98.3 62.6 L 98.3 71 Q 88.566 71 83.779 67.752 A 11.294 11.294 0 0 1 82.45 66.7 Q 77.973 62.56 77.806 52.764 A 45.022 45.022 0 0 1 77.8 52 Z M 104.8 52 L 104.8 1 L 113.8 1 L 113.8 52 A 25.026 25.026 0 0 0 113.9 54.316 Q 114.092 56.374 114.65 57.85 A 7.009 7.009 0 0 0 115.478 59.437 A 5.176 5.176 0 0 0 117.3 61.05 A 13.519 13.519 0 0 0 119.184 61.876 A 10.538 10.538 0 0 0 120.8 62.3 Q 122.5 62.6 125.3 62.6 L 125.3 71 Q 115.566 71 110.779 67.752 A 11.294 11.294 0 0 1 109.45 66.7 Q 104.973 62.56 104.806 52.764 A 45.022 45.022 0 0 1 104.8 52 Z M 55.7 36.3 A 38.5 38.5 0 0 0 54.5 27.283 A 35.333 35.333 0 0 0 54.05 25.7 A 28.161 28.161 0 0 0 51.335 19.546 A 24.777 24.777 0 0 0 49.55 16.95 Q 46.6 13.2 42.4 11 A 19.337 19.337 0 0 0 35.324 8.921 A 23.819 23.819 0 0 0 32.9 8.8 A 21.894 21.894 0 0 0 27.286 9.497 A 18.576 18.576 0 0 0 23.4 11 Q 19.2 13.2 16.25 16.95 A 26.097 26.097 0 0 0 12.409 23.795 A 30.775 30.775 0 0 0 11.75 25.7 Q 10.2 30.7 10.1 36.3 A 39.248 39.248 0 0 0 10.856 43.437 A 33.774 33.774 0 0 0 11.75 46.9 Q 13.3 51.8 16.25 55.4 Q 19.2 59 23.4 61.1 A 19.922 19.922 0 0 0 30.162 63.052 A 24.724 24.724 0 0 0 32.9 63.2 A 22.924 22.924 0 0 0 38.441 62.554 A 19.136 19.136 0 0 0 42.4 61.1 Q 46.6 59 49.55 55.4 Q 52.5 51.8 54.05 46.9 Q 55.6 42 55.7 36.3 Z M 144.8 23 L 144.8 71 L 136 71 L 136 31.4 L 127.8 31.4 L 131.8 23 L 144.8 23 Z M 135.6 13 Q 134.3 11.3 134.3 9.3 A 5.758 5.758 0 0 1 135.595 5.657 A 7.454 7.454 0 0 1 135.6 5.65 A 4.132 4.132 0 0 1 137.84 4.214 Q 138.531 4.027 139.36 4.004 A 8.534 8.534 0 0 1 139.6 4 Q 141.658 4 142.903 4.959 A 3.968 3.968 0 0 1 143.6 5.65 A 5.989 5.989 0 0 1 144.702 7.791 A 5.713 5.713 0 0 1 144.9 9.3 A 5.758 5.758 0 0 1 143.605 12.944 A 7.454 7.454 0 0 1 143.6 12.95 A 4.132 4.132 0 0 1 141.36 14.387 Q 140.669 14.574 139.84 14.597 A 8.534 8.534 0 0 1 139.6 14.6 A 7.211 7.211 0 0 1 138.067 14.448 Q 136.499 14.107 135.6 13 Z"
#PATH = "M 176.8 52.8 L 172.7 52.8 L 172.7 45.1 L 177.5 45.1 Q 182.757 45.1 185.49 43.838 A 6.523 6.523 0 0 0 186.8 43.05 A 6.233 6.233 0 0 0 188.789 40.209 Q 189.171 39.158 189.314 37.855 A 15.158 15.158 0 0 0 189.4 36.2 A 6.597 6.597 0 0 0 189.128 34.252 A 4.933 4.933 0 0 0 187.1 31.55 A 8.623 8.623 0 0 0 184.289 30.341 Q 183.15 30.064 181.823 30.012 A 15.949 15.949 0 0 0 181.2 30 A 16.176 16.176 0 0 0 176.211 30.733 A 12.887 12.887 0 0 0 170.05 35 A 18.12 18.12 0 0 0 166.048 45.493 A 23.122 23.122 0 0 0 166 47 A 20.529 20.529 0 0 0 166.664 52.354 A 15.304 15.304 0 0 0 170.35 59 A 14.504 14.504 0 0 0 179.965 63.526 A 19.866 19.866 0 0 0 181.7 63.6 A 20.962 20.962 0 0 0 186.186 63.146 Q 189.322 62.46 191.688 60.735 A 13.265 13.265 0 0 0 192 60.5 L 198 66.4 A 24.96 24.96 0 0 1 182.285 71.995 A 31.17 31.17 0 0 1 181.7 72 A 31.386 31.386 0 0 1 173.797 71.058 A 22.405 22.405 0 0 1 163.5 65.3 A 22.534 22.534 0 0 1 156.834 50.905 A 30.659 30.659 0 0 1 156.7 48 A 33.829 33.829 0 0 1 157.702 39.547 A 24.512 24.512 0 0 1 163.4 28.9 Q 170.1 21.6 181.7 22 A 31.801 31.801 0 0 1 188.063 22.848 Q 198.7 25.501 198.7 36.1 Q 198.7 52.8 176.8 52.8 Z M 0.755 27.933 A 51.42 51.42 0 0 0 0 36.3 A 53.841 53.841 0 0 0 0.453 42.764 A 41.396 41.396 0 0 0 2.45 51.2 A 36.891 36.891 0 0 0 3.659 54.184 A 30.532 30.532 0 0 0 9.1 62.4 Q 13.4 67 19.45 69.5 A 31.635 31.635 0 0 0 24.795 71.165 A 37.923 37.923 0 0 0 32.9 72 A 40.646 40.646 0 0 0 37.011 71.797 A 33.076 33.076 0 0 0 46.35 69.5 Q 52.4 67 56.7 62.4 A 29.137 29.137 0 0 0 59.762 58.502 A 33.961 33.961 0 0 0 63.35 51.2 A 40.345 40.345 0 0 0 65.099 44.408 A 52.197 52.197 0 0 0 65.8 36.3 A 53.574 53.574 0 0 0 65.402 30.3 A 42.101 42.101 0 0 0 63.3 21.3 Q 60.9 14.6 56.6 9.85 Q 52.3 5.1 46.25 2.55 A 31.201 31.201 0 0 0 41.435 0.972 A 36.318 36.318 0 0 0 32.9 0 A 39.617 39.617 0 0 0 28.63 0.225 A 32.032 32.032 0 0 0 19.5 2.55 Q 13.5 5.1 9.2 9.85 A 31.006 31.006 0 0 0 6.24 13.69 A 36.019 36.019 0 0 0 2.5 21.3 A 40.74 40.74 0 0 0 0.755 27.933 Z M 77.8 52 L 77.8 1 L 86.8 1 L 86.8 52 A 25.026 25.026 0 0 0 86.9 54.316 Q 87.092 56.374 87.65 57.85 A 7.009 7.009 0 0 0 88.478 59.437 A 5.176 5.176 0 0 0 90.3 61.05 A 13.519 13.519 0 0 0 92.184 61.876 A 10.538 10.538 0 0 0 93.8 62.3 Q 95.5 62.6 98.3 62.6 L 98.3 71 Q 88.566 71 83.779 67.752 A 11.294 11.294 0 0 1 82.45 66.7 Q 77.973 62.56 77.806 52.764 A 45.022 45.022 0 0 1 77.8 52 Z M 104.8 52 L 104.8 1 L 113.8 1 L 113.8 52 A 25.026 25.026 0 0 0 113.9 54.316 Q 114.092 56.374 114.65 57.85 A 7.009 7.009 0 0 0 115.478 59.437 A 5.176 5.176 0 0 0 117.3 61.05 A 13.519 13.519 0 0 0 119.184 61.876 A 10.538 10.538 0 0 0 120.8 62.3 Q 122.5 62.6 125.3 62.6 L 125.3 71 Q 115.566 71 110.779 67.752 A 11.294 11.294 0 0 1 109.45 66.7 Q 104.973 62.56 104.806 52.764 A 45.022 45.022 0 0 1 104.8 52 Z M 55.7 36.3 A 38.5 38.5 0 0 0 54.5 27.283 A 35.333 35.333 0 0 0 54.05 25.7 A 28.161 28.161 0 0 0 51.335 19.546 A 24.777 24.777 0 0 0 49.55 16.95 Q 46.6 13.2 42.4 11 A 19.337 19.337 0 0 0 35.324 8.921 A 23.819 23.819 0 0 0 32.9 8.8 A 21.894 21.894 0 0 0 27.286 9.497 A 18.576 18.576 0 0 0 23.4 11 Q 19.2 13.2 16.25 16.95 A 26.097 26.097 0 0 0 12.409 23.795 A 30.775 30.775 0 0 0 11.75 25.7 Q 10.2 30.7 10.1 36.3 A 39.248 39.248 0 0 0 10.856 43.437 A 33.774 33.774 0 0 0 11.75 46.9 Q 13.3 51.8 16.25 55.4 Q 19.2 59 23.4 61.1 A 19.922 19.922 0 0 0 30.162 63.052 A 24.724 24.724 0 0 0 32.9 63.2 A 22.924 22.924 0 0 0 38.441 62.554 A 19.136 19.136 0 0 0 42.4 61.1 Q 46.6 59 49.55 55.4 Q 52.5 51.8 54.05 46.9 Q 55.6 42 55.7 36.3 Z M 144.8 23 L 144.8 71 L 136 71 L 136 31.4 L 127.8 31.4 L 131.8 23 L 144.8 23 Z M 135.6 13 Q 134.3 11.3 134.3 9.3 A 5.758 5.758 0 0 1 135.595 5.657 A 7.454 7.454 0 0 1 135.6 5.65 A 4.132 4.132 0 0 1 137.84 4.214 Q 138.531 4.027 139.36 4.004 A 8.534 8.534 0 0 1 139.6 4 Q 141.658 4 142.903 4.959 A 3.968 3.968 0 0 1 143.6 5.65 A 5.989 5.989 0 0 1 144.702 7.791 A 5.713 5.713 0 0 1 144.9 9.3 A 5.758 5.758 0 0 1 143.605 12.944 A 7.454 7.454 0 0 1 143.6 12.95 A 4.132 4.132 0 0 1 141.36 14.387 Q 140.669 14.574 139.84 14.597 A 8.534 8.534 0 0 1 139.6 14.6 A 7.211 7.211 0 0 1 138.067 14.448 Q 136.499 14.107 135.6 13 Z"
#PATH = "M 82.8 74 L 73.8 74 L 73.8 22 L 82.5 22 L 82.5 30.7 Q 85.3 26.5 89.65 23.65 A 17.316 17.316 0 0 1 96.756 21.025 A 22.629 22.629 0 0 1 100 20.8 A 23.225 23.225 0 0 1 105.065 21.318 Q 110.159 22.456 113.15 26.1 Q 117.275 31.126 117.488 39.209 A 33.764 33.764 0 0 1 117.5 40.1 L 117.5 74 L 108.5 74 L 108.5 41.1 A 19.265 19.265 0 0 0 108.158 37.359 Q 107.719 35.145 106.719 33.397 A 10.966 10.966 0 0 0 105.85 32.1 A 8.579 8.579 0 0 0 99.573 28.747 A 12.061 12.061 0 0 0 98.5 28.7 A 13.122 13.122 0 0 0 91.651 30.664 A 17.353 17.353 0 0 0 89.8 31.95 Q 85.7 35.2 82.8 39.6 L 82.8 74 Z M 64.8 71.5 L 56.1 75 L 48.3 55 L 15.9 55 L 8.1 74.8 L 0 71.5 L 27.4 4 L 37.8 4 L 64.8 71.5 Z M 196.7 56.1 L 196.7 31.7 L 187.7 31.7 L 187.7 23.9 L 196.9 23.9 L 198.8 7.5 L 205.7 7.5 L 205.7 23.9 L 220.1 23.9 L 220.1 31.7 L 205.7 31.7 L 205.7 56.8 A 21.559 21.559 0 0 0 205.868 59.596 Q 206.341 63.202 208.15 64.9 Q 210.6 67.2 214 67.2 Q 216.5 67.2 218.75 66.4 Q 221 65.6 222.9 64.5 L 225.4 71.7 A 18.546 18.546 0 0 1 223.782 72.556 Q 222.98 72.935 222.034 73.308 A 43.365 43.365 0 0 1 220 74.05 Q 216.6 75.2 212.9 75.2 Q 205.4 75.2 201.05 70.25 A 16.116 16.116 0 0 1 197.822 64.348 Q 197.059 61.917 196.815 58.98 A 34.777 34.777 0 0 1 196.7 56.1 Z M 168.6 26.2 L 168.6 22 L 176.8 22 L 176.8 61.4 A 12.15 12.15 0 0 0 176.902 63.036 Q 177.234 65.47 178.65 66.35 Q 180.5 67.5 182.7 67.5 L 180.8 74.5 A 17.722 17.722 0 0 1 176.535 74.028 Q 170.898 72.628 169.303 67.08 A 13.59 13.59 0 0 1 169.2 66.7 A 21.307 21.307 0 0 1 166.09 70.126 A 28.498 28.498 0 0 1 162.95 72.55 Q 159 75.2 152.9 75.2 Q 146.4 75.2 141.1 71.9 A 22.947 22.947 0 0 1 133.687 64.373 A 27.923 27.923 0 0 1 132.65 62.55 A 27.228 27.228 0 0 1 130.02 54.608 A 36.644 36.644 0 0 1 129.5 48.3 A 33.142 33.142 0 0 1 130.497 40.031 A 27.968 27.968 0 0 1 132.65 34.3 Q 135.8 28.1 141.35 24.45 A 22.297 22.297 0 0 1 152.545 20.844 A 27.388 27.388 0 0 1 154.1 20.8 A 22.584 22.584 0 0 1 158.894 21.29 A 18.703 18.703 0 0 1 162.25 22.35 A 26.002 26.002 0 0 1 166.537 24.644 A 22.103 22.103 0 0 1 168.6 26.2 Z M 291.7 57.7 L 291.7 0 L 300.7 0 L 300.7 56.8 A 20.644 20.644 0 0 0 300.888 59.688 Q 301.35 62.952 302.95 64.8 A 7.363 7.363 0 0 0 307.534 67.276 A 10.724 10.724 0 0 0 309.2 67.4 Q 311.1 67.4 312.95 66.95 A 22.192 22.192 0 0 0 314.413 66.544 Q 315.348 66.247 316.1 65.9 L 318.3 73.2 Q 316.901 73.822 314.988 74.323 A 34.978 34.978 0 0 1 313.85 74.6 A 23.816 23.816 0 0 1 310.695 75.085 A 30.514 30.514 0 0 1 308 75.2 A 20.862 20.862 0 0 1 303.11 74.646 A 17.544 17.544 0 0 1 299.7 73.45 A 12.683 12.683 0 0 1 294.375 68.685 A 15.856 15.856 0 0 1 293.85 67.8 Q 292.116 64.654 291.78 60.012 A 32.105 32.105 0 0 1 291.7 57.7 Z M 241 71.75 A 24.559 24.559 0 0 0 245.598 73.84 Q 249.653 75.2 254.3 75.2 Q 261.7 75.2 267.55 71.8 Q 273.4 68.4 276.8 62.25 A 26.255 26.255 0 0 0 279.453 55.109 A 34.184 34.184 0 0 0 280.2 47.8 A 34.542 34.542 0 0 0 279.715 41.891 A 25.795 25.795 0 0 0 276.75 33.45 Q 273.3 27.4 267.45 24.1 A 24.848 24.848 0 0 0 262.809 22.073 A 27.738 27.738 0 0 0 254.3 20.8 A 31.325 31.325 0 0 0 252.72 20.839 A 26.169 26.169 0 0 0 241.1 24.1 Q 235.2 27.4 231.8 33.5 A 26.023 26.023 0 0 0 229.051 41.09 A 35.006 35.006 0 0 0 228.4 48 A 34.82 34.82 0 0 0 228.665 52.354 A 27.451 27.451 0 0 0 231.75 62.15 Q 235.1 68.3 241 71.75 Z M 254.3 67.2 Q 262.2 67.2 266.6 61.85 A 18.802 18.802 0 0 0 270.419 53.76 A 27.105 27.105 0 0 0 271 48 Q 271 42.8 268.8 38.45 A 19.198 19.198 0 0 0 264.628 32.881 A 18.17 18.17 0 0 0 262.85 31.45 Q 259.1 28.8 254.3 28.8 A 19.249 19.249 0 0 0 249.074 29.472 A 14.037 14.037 0 0 0 242 34 A 17.878 17.878 0 0 0 238.326 41.374 Q 237.6 44.306 237.6 47.8 Q 237.6 53 239.8 57.45 A 19.437 19.437 0 0 0 243.33 62.49 A 17.627 17.627 0 0 0 245.75 64.55 Q 249.5 67.2 254.3 67.2 Z M 167.8 60.7 L 167.8 32.8 Q 165.1 30.9 161.85 29.75 Q 158.6 28.6 155 28.6 A 15.924 15.924 0 0 0 150.029 29.354 A 14.024 14.024 0 0 0 146.55 31.05 A 16.301 16.301 0 0 0 141.531 36.474 A 19.962 19.962 0 0 0 140.8 37.85 A 20.663 20.663 0 0 0 139.047 43.527 A 27.678 27.678 0 0 0 138.7 48 Q 138.7 53.6 140.8 57.95 A 17.602 17.602 0 0 0 143.906 62.496 A 15.697 15.697 0 0 0 146.6 64.75 Q 150.3 67.2 154.9 67.2 Q 158.7 67.2 162.1 65.35 Q 165.5 63.5 167.8 60.7 Z M 32.1 13.4 L 18.9 47 L 45.2 47 L 32.1 13.4 Z"

def integrate_poly_exp(p, a, x0):
    """
    Evaluates the integral of x^p * e^(ax) dx at x = x0.
    Uses integration by parts.
    Should be used for definite integration in which case would equire two calls:
      integrate_poly_exp(p, a, hi) - integrate_poly_exp(p, a, lo)
    """

    if abs(a) < 1e-5:
        return 1 / (p+1) * (x0 ** (p+1))

    if p == 0:
        return 1 / a * exp(a * x0)
    else:
        return x0 ** p * exp(a * x0) / a - p / a * integrate_poly_exp(p-1, a, x0)
    
def fourier_transform_polynomial(a, p, omega, lo, hi):
    """
    Evaluates the fourier transform for some angular frequency of a * x^p
    """

    c = -1j * omega

    return a * (integrate_poly_exp(p, c, hi) - integrate_poly_exp(p, c, lo))

def fourier_transform_exp(a, b, omega, lo, hi):
    """
    Evaluates the fourier transform for some angular frequency of a * e ^ (bx)
    """

    c = -1j * omega

    p = (b + c)

    if abs(p) < 1e-5:
        return a * (hi - lo)

    return a * (1 / p) * (exp(p * hi) - exp(p * lo))

def fourier_transform_constant(a, omega, lo, hi):
    if omega == 0:
        return a * (hi - lo)
    
    c = -1j * omega

    return a * (1 / c) * (exp(c * hi) - exp(c * lo))

def bezier_fourier(p0, p1, p2, p3, lo, hi, omega):
    # p0 Contribution
    # x = t / (hi - lo) - lo / (hi - lo)
    #
    # Cont = (1-x)^3 * p0
    #      = 1/(hi-lo)^3 * (hi - x)^3 * p0
    #      = 1/(hi-lo)^3 * (hi^3 - 3 * hi^2 * x + 3 * hi * x^2 - x^3) * p0

    # p1 Contribution
    # Cont = 3 * (1-x)^2 * x * p1
    #      = 3 / (hi-lo)^3 * (hi - x)^2 * (x - lo) * p1
    #      = 3 / (hi-lo)^3 * (x^2 - 2 * hi * x + hi^2) * (x - lo) * p1
    #      = 3 / (hi-lo)^3 * (x^3 - 2 * hi * x^2 + hi^2 * x - lo * x^2 + 2 * hi * lo * x - lo * hi^2) * p1
    #      = 3 / (hi-lo)^3 * (x^3 - (2 * hi - lo) * x^2 + (hi^2 + 2 * hi * lo) * x - lo * hi^2) * p1 

    def integrate_thing2(pa, pb, lo, hi, x0):
        if pa == 0:
            return 1 / (pb+1) * (x0 - lo) ** (pb+1)
        elif pb == 0:
            return -1 / (pa+1) * (hi - x0) ** (pa+1)
        else:
            return (hi - x0) ** pa * 1 / (pb+1) * (x0 - lo) ** (pb+1) - (-pa) * (1 / (pb+1)) * integrate_thing2(pa-1, pb+1, lo, hi, x0)
        
    def integrate_thing(pa, pb, lo, hi, w, x0):
        if abs(w) < 1e-5:
            return integrate_thing2(pa, pb, lo, hi, x0)

        if pa == 0 and pb == 0:
            return 1 / w * exp(w * x0)
        elif pb == 0:
            return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (-1) * pa * integrate_thing(pa-1, pb, lo, hi, w, x0)
        elif pa == 0:
            return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (+1) * pb * integrate_thing(pa, pb-1, lo, hi, w, x0)
        else:
            return (1 / w) * exp(w * x0) * ((hi - x0) ** pa * (x0 - lo) ** pb) - (1/w) * (-1) * pa * integrate_thing(pa-1, pb, lo, hi, w, x0) - (1/w) * (+1) * pb * integrate_thing(pa, pb-1, lo, hi, w, x0)

    def fourier_thing(pa, pb, lo, hi, omega):
        w = -1j * omega
        return integrate_thing(pa, pb, lo, hi, w, hi) - integrate_thing(pa, pb, lo, hi, w, lo)

    res = 0

    res += 1 * p0 * fourier_thing(3, 0, lo, hi, omega)
    res += 3 * p1 * fourier_thing(2, 1, lo, hi, omega)
    res += 3 * p2 * fourier_thing(1, 2, lo, hi, omega)
    res += 1 * p3 * fourier_thing(0, 3, lo, hi, omega)

    #print("Bezier", lo, hi)

    res /= (hi - lo) * (hi - lo) * (hi - lo)

    return res

def path_fourier(path, omega):
    t = 0
    res = 0

    path_len = 0
    for elem in path:
        if not (isinstance(elem, Move) or isinstance(elem, Close) and abs(elem.start - elem.end) < 1e-9):
            path_len += 1

    for i in range(len(path)):
        elem = path[i]

        lo = t / path_len
        hi = (t+1) / path_len

        if isinstance(elem, Arc):
            # Fourier of arc
            #rot = elem.rotation
            #start = radians(elem.theta)
            #speen = radians(rot)
            #delta = 0.3#radians(elem.delta)

            ra = elem.radius.real
            rb = elem.radius.imag
            
            #center = elem.center

            # Library doesn't calculate necessary components correctly
            half_dx = 0.5 * (elem.start.real - elem.end.real)
            half_dy = 0.5 * (elem.start.imag - elem.end.imag)

            avg_x = 0.5 * (elem.start.real + elem.end.real)
            avg_y = 0.5 * (elem.start.imag + elem.end.imag)

            x1_prime = cos(radians(elem.rotation)) * half_dx + sin(radians(elem.rotation)) * half_dy
            y1_prime = -sin(radians(elem.rotation)) * half_dx + cos(radians(elem.rotation)) * half_dy

            horror = (ra * ra * rb * rb - ra * ra * y1_prime * y1_prime - rb * rb * x1_prime * x1_prime) / (ra * ra * y1_prime * y1_prime + rb * rb * x1_prime * x1_prime)
            sqrt_thing = sqrt(horror)

            if elem.arc == elem.sweep:
                sqrt_thing *= -1

            cx_prime =  sqrt_thing * ra * y1_prime / rb
            cy_prime = -sqrt_thing * rb * x1_prime / ra

            cx = cos(radians(elem.rotation)) * cx_prime - sin(radians(elem.rotation)) * cy_prime + avg_x
            cy = sin(radians(elem.rotation)) * cx_prime + cos(radians(elem.rotation)) * cy_prime + avg_y

            center = cx + cy * 1j

            def angle_between(ux, uy, vx, vy):
                return sign(ux * vy - uy * vx) * acos((ux * vx + uy * vy) / (hypot(ux, uy) * hypot(vx, vy)))

            start = angle_between(1, 0, (x1_prime - cx_prime) / ra, (y1_prime - cy_prime) / rb)
            delta = angle_between((x1_prime - cx_prime) / ra, (y1_prime - cy_prime) / rb, (- x1_prime - cx_prime) / ra, (- y1_prime - cy_prime) / rb) % (2 * pi)

            if not elem.sweep:
                delta -= 2 * pi

            speen = radians(elem.rotation)

            # We can express an arc as follows:
            #   center + 0.5 * ((ra + rb) * e ^ (i * t * delta) + (ra - rb) * e ^ (- i * t * delta)) * e^(i * start)
            # = center + 0.5 * (ra + rb) * e^(i * start) * e ^ (i * t * delta) + 0.5 * (ra - rb) * e^(i * start) * e ^ (- i * t * delta)

            # Shifted:
            #   0.5 * (ra + rb) * e^(i * start) * e ^ (i * (t / (hi - lo) + lo) * delta)

            res += fourier_transform_constant(center, omega, lo, hi) \
                + fourier_transform_exp(0.5 * (ra+rb) * exp((speen + start - lo / (hi - lo) * delta) * 1j),  delta * 1j / (hi - lo), omega, lo, hi) \
                + fourier_transform_exp(0.5 * (ra-rb) * exp((speen - start + lo / (hi - lo) * delta) * 1j), -delta * 1j / (hi - lo), omega, lo, hi)
            
            t += 1
        elif isinstance(elem, Line) or isinstance(elem, Close) and abs(elem.start - elem.end) >= 1e-9:
            delta = (elem.end - elem.start) / (hi - lo)
            start = elem.start - delta * lo

            # elem.start + delta * t
            res += fourier_transform_constant(start, omega, lo, hi) \
                + fourier_transform_polynomial(delta, 1, omega, lo, hi)

            t += 1
        elif isinstance(elem, CubicBezier):
            res += bezier_fourier(elem.start, elem.control1, elem.control2, elem.end, lo, hi, omega)
            t += 1
        elif isinstance(elem, QuadraticBezier):
            res += bezier_fourier(
                elem.start,
                elem.start + 2 / 3 * (elem.control - elem.start),
                elem.end   + 2 / 3 * (elem.control - elem.end),
                elem.end,
                lo, hi, omega
            )
            t += 1
        else:
            #print("Unknown element", elem)
            continue
            
        
    return res

def generate_circles(path, max_freq):
    freqs = list(range(-max_freq, max_freq+1))
    transform = [path_fourier(path, 2 * pi * i) for i in freqs]

    offset = [path.boundingbox()[0], path.boundingbox()[1]]
    transform[freqs.index(0)] -= offset[0] + offset[1] * 1j

    circles = [[freq, p.real, p.imag] for freq, p in zip(freqs, transform)]

    circles.sort(key = lambda x: -hypot(x[1], x[2]))

    return circles, offset

def draw_fourier(circles, n_points, fig: plt.Figure, ax: plt.Axes, offset):
    points = []
    
    for i in range(n_points):
        t = i / n_points
        res = offset[0] + offset[1] * 1j
        for circle in circles:
            freq = circle[0]
            c = circle[1] + circle[2] * 1j

            res += c * exp(2 * pi * freq * t * 1j)

        points.append(res)

    ax.scatter([x.real for x in points], [x.imag for x in points])
    

with open("path.txt") as f:
    path = parse_path(f.read())

SIZE = 25

parts = [[]]

for i in range(len(path)):
    if isinstance(path[i], Move):
        if len(parts[-1]):
            parts.append([])

    parts[-1].append(path[i])

parts = [Path(*x) for x in parts]

fig, ax = plt.subplots()
ax.axis("equal")

data = []

for part in parts:
    circles, offset = generate_circles(part, SIZE)
    draw_fourier(circles, 1000, fig, ax, offset)

    data.append({
        "circles": circles,
        "offset": offset
    })

with open("circles.json", "w") as f:
    json.dump(data, f)

ax.set_ylim(ax.get_ylim()[::-1])
plt.show()

# freqs = list(range(-SIZE, SIZE+1))
# transform = [path_fourier(path, 2 * pi * i) for i in freqs]

# points = []
# N = 5000

# for i in range(N):
#     t = i / N

#     res = 0
#     for j in range(len(transform)):
#         res += transform[j].conjugate() * exp(2 * pi * freqs[j] * t * 1j)
#     points.append(res)

# min_x = min(x.real for x in points)
# min_y = min(-x.imag for x in points)

# print(min_x, min_y)

# circles = [[freq, p.real, p.imag] for freq, p in zip(freqs, transform)]

# circles[freqs.index(0)][1] -=  min_x
# circles[freqs.index(0)][2] -=  min_y

# circles.sort(key = lambda x: -hypot(x[1], x[2]))
# #print(circles)
# pyperclip.copy(repr(circles))

# #print(points)

# #print(points)
# plt.scatter([p.real for p in points], [p.imag for p in points])
# plt.axis('equal')
# plt.show()
