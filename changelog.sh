#!/bin/bash
git log v2.8.0..HEAD --no-merges --format=%B > CHANGELOG.TXT
