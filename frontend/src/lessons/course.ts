import type { Component, InjectionKey } from 'vue';

import BasicsPage from '../components/pages/BasicsPage.vue';
import PrimitivePage from '../components/pages/PrimitivePage.vue';
import PromptTaskPage from '../components/pages/PromptTaskPage.vue';
import ProtocolPage from '../components/pages/ProtocolPage.vue';
import QaPage from '../components/pages/QaPage.vue';
import ResourceTaskPage from '../components/pages/ResourceTaskPage.vue';
import ToolTaskPage from '../components/pages/ToolTaskPage.vue';
import { useProvided } from '../composables/provided.ts';
import type { Content, Topic } from '../content/content.ts';
import { TOOL_LESSON } from '../core/tool-lesson/lesson-info.ts';
import { Film } from '../film/film.ts';
import { toolFilmScenes } from './tool-film/scenes.ts';

interface Step {
    id: string;
    module: string;
    title: string;
    page: Component;
    props: object;
    sections?: string[];
    requires?: string;
}

export interface Group {
    caption: string;
    label: string;
    children: Branch[];
}

export interface Place {
    label: string;
    step: Step;
    section?: string;
}

export type Branch = Group | Place;

export function buildCourse(content: Content) {
    const { modules, primitives } = content.nav;

    const theory = (id: 'basics' | 'protocol' | 'qa', page: Component): Step => ({
        id,
        module: modules[id].label,
        title: modules[id].title,
        page,
        props: { stepId: id },
        sections: Object.keys(content[id].sections)
    });
    const topics = (step: Step, sections: Record<string, Topic>): Branch => ({
        caption: step.module,
        label: step.title,
        children: Object.entries(sections).map(([section, topic]) => ({ label: `${topic.number} ${topic.title}`, step, section }))
    });
    const primitive = (id: keyof typeof primitives, task: Component, taskProps: object, example?: object): Place[] => {
        const { theory, practice } = primitives[id];
        const module = modules.primitives.label;
        const read: Step = { id, module, title: theory.title, page: PrimitivePage, props: { text: content.lessons[id], example } };
        const solve: Step = { id: `${id}-task`, module, title: practice.title, page: task, props: taskProps, requires: id };
        return [
            { label: theory.short, step: read },
            { label: practice.short, step: solve }
        ];
    };

    const basics = theory('basics', BasicsPage);
    const protocol = theory('protocol', ProtocolPage);
    const qa = theory('qa', QaPage);
    const { title, about, film } = content.toolFilm;
    const places = [
        ...primitive('resources', ResourceTaskPage, {}),
        ...primitive('tools', ToolTaskPage, { lessonId: TOOL_LESSON.id }, { title, about, film: new Film(film.title, toolFilmScenes(film)) }),
        ...primitive('prompts', PromptTaskPage, {})
    ];

    const tree: Branch[] = [
        topics(basics, content.basics.sections),
        topics(protocol, content.protocol.sections),
        topics(qa, content.qa.sections),
        { caption: modules.primitives.label, label: modules.primitives.title, children: places }
    ];
    return { steps: [basics, protocol, qa, ...places.map(place => place.step)], tree };
}

export const COURSE: InjectionKey<ReturnType<typeof buildCourse>> = Symbol('course');

export function useCourse() {
    return useProvided(COURSE);
}
