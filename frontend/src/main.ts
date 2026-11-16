import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './theme/tokens.css';
import './theme/base.css';
import './theme/blocks.css';

import { createApp } from 'vue';

import App from './App.vue';
import { CONTENT } from './content/content.ts';
import { languageOf, LANGUAGES } from './content/languages.ts';
import { SavedChoices } from './core/saved-choices.ts';
import { TOOL_LESSON } from './core/tool-lesson/lesson-info.ts';
import { createPlace } from './motion/place.ts';
import { buildCourse, COURSE } from './lessons/course.ts';
import { LESSONS, LessonStore } from './store/lesson-store.ts';
import { SandboxWords } from './store/sandbox-words.ts';
import { createTasks, TASKS } from './store/task-bench.ts';
import { VISITOR, VisitorStore } from './store/visitor-store.ts';

const visitor = new VisitorStore(new SavedChoices('mcp-playground:'));
const language = languageOf(visitor.language);
const { content } = LANGUAGES[language];
const loadToolLesson = () => import('./core/tool-lesson/tool-lesson.ts').then(({ createToolLesson }) => createToolLesson());
const lessons = new LessonStore([{ info: TOOL_LESSON, load: loadToolLesson }], new SandboxWords(content.sandbox));
document.documentElement.lang = language;

createApp(App)
    .provide(CONTENT, content)
    .provide(COURSE, buildCourse(content))
    .provide(LESSONS, lessons)
    .provide(TASKS, createTasks(content))
    .provide(VISITOR, visitor)
    .directive('place', createPlace())
    .mount('#app');
