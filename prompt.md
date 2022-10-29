# Story: Create a question

As a user (personal metrics nerd)
In order to collect interesting data
I want to create a recurring question.

Given there a no recurring questions
When I create a recurring question
Then I should receive a prompt a the times I set

Story: Answer a prompt

Given a prompt
When I enter an answer
Then the answer is recorded

Story: View my answers

Given some answers recorded
When I view the view the answers
Then I get a list of all my answers

# Domain: Data Collection

Vocabulary:
Recurring Question

A recurring question is something you set which creates a recurring prompts

Ex. A user creates a recurring question:
Question: Have you completed strength training today?
Period: Daily
Type: Yes/no

Prompt:
A prompt which collects one answer (data point)

Prompt Queue:
A queue where prompts appear based on question schedule

Answer:
A data point which records the answer to one prompt

# Interface Boundaries

CLIENT

UI | Adapter for UI (async interface) | Port (Well-defined API) | Domain Core
UI | Adapter for REST (async interface) | Port (Well-defined API) | Domain Core
UI | Adapter for CLI (async interface) | Port (Well-defined API) | Domain Core
