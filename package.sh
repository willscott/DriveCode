#!/bin/bash

rm DriveCode.zip
mkdir DriveCode

# Our Code
cp manifest.json DriveCode

# Images
mkdir DriveCode/images
cp images/mirror-128.png images/mirror-19.png images/mirror-16.png Drivecode/images

cp -r _locales DriveCode/

zip -0 -r DriveCode.zip DriveCode DriveCode/*
rm -r DriveCode
