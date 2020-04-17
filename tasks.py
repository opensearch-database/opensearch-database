import typing as T
import inquirer
import invoke as api
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
from urlpath import URL
from yattag import Doc, indent

DATA_PATH = Path(__file__).parent / 'data'

OPENSEARCH_XMLNS = 'http://a9.com/-/spec/opensearch/1.1/'
MOZ_XMLNS = 'http://www.mozilla.org/2006/browser/search/'

OPENSEARCH_MIME_TYPE = 'application/opensearchdescription+xml'

UPDATE_URL = 'https://raw.githubusercontent.com/opensearch-database/opensearch-database/master/data/{hostname}.xml'

THEME = inquirer.themes.GreenPassion()


class Prompt:
    def _make_prompter(cls: T.Type[inquirer.questions.Question]):
        @staticmethod
        def _prompter(message: str, **kwargs: T.Any) -> T.Any:
            from inquirer.render.console import ConsoleRender

            render = ConsoleRender(theme=THEME)

            question = cls('', message=message, **kwargs)
            return render.render(question)
        return _prompter

    text = _make_prompter(inquirer.Text)
    confirm = _make_prompter(inquirer.Confirm)


def image(url: URL) -> Image:
    from io import BytesIO

    data = BytesIO(url.get().content)
    return Image.open(data)


@api.task
def add(ctx, url):
    url = URL(url)
    content = url.get().text
    document = BeautifulSoup(content, 'html.parser')

    doc = Doc()

    doc.asis('<?xml version="1.0" encoding="UTF-8" ?>')
    with doc.tag('OpenSearchDescription', ('xmlns', OPENSEARCH_XMLNS), ('xmlns:moz', MOZ_XMLNS)):
        title = ' '.join(map(str.strip, document.title.text.splitlines()))
        short_name = Prompt.text('Short name', default=title)
        with doc.tag('ShortName'):
            doc.text(short_name)

        for node in document.head.find_all('link', rel='icon'):
            mime_type = node['type']
            href = url / node['href']
            img = image(href)

            with doc.tag('Image', type=mime_type, width=img.width, height=img.height):
                doc.text(str(href))

        if Prompt.confirm('Add icons?', default=False):
            while True:
                href = Prompt.text('Icon URL')
                if href is None or href == '':
                    break

                img = image(URL(href))
                mime_type = Image.MIME[img.format]

                with doc.tag('Image', type=mime_type, width=img.width, height=img.height):
                    doc.text(href)

        search_url = inquirer.text('Search URL', default=url).replace('%s', '{searchTerms}')
        doc.stag('Url', type='text/html', template=search_url)

        doc.stag('Url', type=OPENSEARCH_MIME_TYPE, rel='self', template=UPDATE_URL.format(hostname=url.hostname))

        with doc.tag('moz:SearchForm'):
            doc.text(str(url))

    xml = indent(doc.getvalue(), indentation='    ', newline='\n')

    doc_path = DATA_PATH / f'{url.hostname}.xml'
    with doc_path.open('w+') as f:
        f.write(xml)
