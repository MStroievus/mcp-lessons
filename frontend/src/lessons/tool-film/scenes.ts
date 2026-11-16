import type { FilmText } from '../../content/content.ts';
import { FilmScene } from '../../film/film-scene.ts';
import type { Shot } from '../../film/shot.ts';
import ExchangeFrame, { type ExchangeProps, type Param } from './ExchangeFrame.vue';
import TallyFrame from './TallyFrame.vue';

const arg = (param: Param, value: string) => ({ key: param.name, value });

abstract class ToolScene extends FilmScene {
    protected readonly text: FilmText;

    constructor(text: FilmText) {
        super();
        this.text = text;
    }
}

abstract class ExchangeScene extends ToolScene {
    readonly frame = ExchangeFrame;
    abstract readonly frameProps: ExchangeProps;

    protected exchange(shot: Shot, count: string) {
        shot.lookAway().appear('call-copy').carry('call-copy', 'server').pulse('server').write('count', count).pulse('count');
        shot.bring('reply', 'server').look('reply').hold().lookAway();
    }

    protected answer(shot: Shot) {
        shot.bring('answer', 'model').write('answer-text', this.frameProps.answer ?? '').hold();
    }
}

class FirstCallScene extends ExchangeScene {
    readonly id = 'first';
    readonly title = this.text.chapters.first;
    readonly frameProps: ExchangeProps = {
        text: this.text,
        params: [this.text.city],
        count: '0',
        call: [arg(this.text.city, this.text.cityValue)],
        reply: { text: this.text.twoCities, error: true }
    };

    protected direct(shot: Shot) {
        shot.absent('question', 'call', 'call-copy', 'reply').lay('question').look('question');
        shot.look('tool-about').look('tool-params').lay('call').take('call-value-0', 'question-city');
        this.exchange(shot, '1');
    }
}

class SecondTryScene extends ExchangeScene {
    readonly id = 'second';
    readonly title = this.text.chapters.second;
    readonly frameProps: ExchangeProps = {
        text: this.text,
        params: [this.text.city],
        count: '1',
        call: [arg(this.text.city, this.text.cityValue)],
        sent: [arg(this.text.city, this.text.squeezedValue)],
        earlier: { text: this.text.twoCities, error: true },
        reply: { text: this.text.unknownCity, error: true },
        answer: this.text.giveUp
    };

    protected direct(shot: Shot) {
        shot.absent('call-copy', 'reply', 'answer').look('earlier').hold();
        shot.look('tool-params').refuse('tool-params').lookAway().lift('earlier');
        shot.write('call-value-0', this.text.squeezedValue).hold();
        this.exchange(shot, '2');
        this.answer(shot);
    }
}

class NewParameterScene extends ExchangeScene {
    readonly id = 'change';
    readonly title = this.text.chapters.change;
    readonly frameProps: ExchangeProps = { text: this.text, params: [this.text.city, this.text.country], count: '0' };

    protected direct(shot: Shot) {
        shot.absent('tool-param-1').hold().lay('tool-param-1').look('tool-param-1').hold().lookAway();
    }
}

class AtOnceScene extends ExchangeScene {
    readonly id = 'once';
    readonly title = this.text.chapters.once;
    readonly frameProps: ExchangeProps = {
        text: this.text,
        params: [this.text.city, this.text.country],
        count: '0',
        call: [arg(this.text.city, this.text.cityValue), arg(this.text.country, this.text.countryValue)],
        reply: { text: this.text.weather, error: false },
        answer: this.text.answer
    };

    protected direct(shot: Shot) {
        shot.absent('call', 'call-arg-1', 'call-copy', 'reply', 'answer').look('question');
        shot.look('tool-param-0').lay('call').take('call-value-0', 'question-city');
        shot.look('tool-param-1').lay('call-arg-1').hold();
        this.exchange(shot, '1');
        this.answer(shot);
    }
}

class SummaryScene extends ToolScene {
    readonly id = 'summary';
    readonly title = this.text.chapters.summary;
    readonly frame = TallyFrame;
    readonly frameProps = { text: this.text };

    protected direct(shot: Shot) {
        shot.absent('before', 'before-outcome', 'after', 'after-outcome');
        shot.lay('before').lay('before-outcome').hold().lay('after').lay('after-outcome').look('after-param-1').hold();
    }
}

export function toolFilmScenes(text: FilmText) {
    return [FirstCallScene, SecondTryScene, NewParameterScene, AtOnceScene, SummaryScene].map(Scene => new Scene(text));
}
