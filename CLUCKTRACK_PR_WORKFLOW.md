@'

\# CluckTrack Pull Request Workflow



\## Purpose



Use this workflow for every feature branch and pull request.



The primary goal is to make small, reviewable changes without accidental

whole-file reformatting, unrelated modifications, or large diff explosions.



\---



\## 1. Start With a Clean Baseline



Check:



```powershell

git status

git branch --show-current

git diff --stat

