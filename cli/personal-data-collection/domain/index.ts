import { PromptQueue } from './usecases/prompt-queue.js'
import recurringQuestionRepositoryFileSystem from '../infrastructure/recurring-question-repository-file-system.js'
import answerRepositoryFileSystem from '../infrastructure/answer-repository-file-system.js'

export const promptQueue = PromptQueue(recurringQuestionRepositoryFileSystem())(answerRepositoryFileSystem())