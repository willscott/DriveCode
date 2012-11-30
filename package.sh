#!/bin/bash

rm DriveCode.zip
mkdir DriveCode

# Our Code
cp manifest.json *.js *.css *.html DriveCode

# Images
mkdir DriveCode/images
cp images/mirror-128.png images/mirror-19.png images/mirror-16.png Drivecode/images

# I18N
cp -R _locales DriveCode

# Code Mirror
mkdir DriveCode/CodeMirror
cp -R CodeMirror/lib CodeMirror/mode CodeMirror/keymap DriveCode/CodeMirror/

zip -0 -r DriveCode.zip DriveCode DriveCode/*
rm -r DriveCode
