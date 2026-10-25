import { ArrowRight, ExternalLink, LayoutGrid, List, Plus, Save, Search, Settings, Trash2 } from 'lucide-react';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppShell,
  Button,
  Checkbox,
  Combobox,
  Field,
  Input,
  RadioGroup,
  SegmentedControl,
  NativeSelect,
  Select,
  Switch,
  Textarea,
  IconButton,
  IconProvider,
  LinkButton,
  ThemeProvider,
  ThemeSwitcher,
  THEME_NAMES,
  ToastProvider,
  TooltipProvider,
  useDocumentTitle,
  type ButtonVariant,
} from '../src/react/index.ts';
import { Content } from './content.tsx';
import { Overlays } from './overlays.tsx';
import './app.css';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'danger-outline', 'link'];
const dense = new URLSearchParams(location.search).get('density') === 'dense';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="rounded-card border border-border bg-surface p-4">
      <h2 id={`${id}-h`} className="mb-4 text-heading">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

const COMPANIES = [
  { value: 'acme', label: 'Acme', detail: 'Buenos Aires' },
  { value: 'lumux', label: 'Lumux', detail: 'Asunción' },
  { value: 'northstar', label: 'Northstar', detail: 'Montevideo' },
];

function Forms() {
  const [notify, setNotify] = useState(true);
  const [plan, setPlan] = useState<string | undefined>('team');
  const [view, setView] = useState<'list' | 'grid' | 'board'>('list');
  const [company, setCompany] = useState<string>();
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  // Stable identities: a fresh array per render would read as new results to the Combobox.
  const [companies, setCompanies] = useState([...COMPANIES, { value: 'slate', label: 'Slate Labs', detail: 'Cached' }]);
  useEffect(() => {
    if (!companyQuery) return;
    setCompanyLoading(true);
    // "sl…" is the slow search, so a test can look at the loading state; the stale cache entry vanishes when results land.
    const timer = window.setTimeout(() => {
      setCompanies(COMPANIES);
      setCompanyLoading(false);
    }, companyQuery.toLowerCase().startsWith('sl') ? 1500 : 150);
    return () => window.clearTimeout(timer);
  }, [companyQuery]);
  return (
    <section aria-labelledby="forms-h" className="rounded-card border border-border bg-surface p-4">
      <h2 id="forms-h" className="mb-4 text-heading">
        Forms
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email" hint="We only use it for sign-in links." required>
          <Input type="email" autoComplete="email" defaultValue="ana@example.com" />
        </Field>
        <Field label="Company" error="Enter the company name.">
          <Input autoComplete="organization" data-testid="invalid-input" />
        </Field>
        <Field label="Phone">
          <Input id="phone-own-id" type="tel" autoComplete="tel" />
        </Field>
        <Field label="Search">
          <Input type="search" icon={<Search />} placeholder="Name or email" autoComplete="off" />
        </Field>
        <Field label="Company picker" hint="Search, choose an existing company or create one.">
          <Combobox
            options={companies}
            value={company}
            onChange={setCompany}
            onQueryChange={setCompanyQuery}
            loading={companyLoading}
            placeholder="Search companies"
            createLabel={(query) => `Create “${query}”`}
            onCreate={(query) => setCompany(`new:${query}`)}
            renderOption={(option) => (
              <span className="flex min-w-0 flex-col">
                <span>{option.label}</span>
                <span className="text-body-sm text-foreground-muted">{option.detail}</span>
              </span>
            )}
          />
        </Field>
        <Field label="Country" hint="Where invoices are issued.">
          <Select
            autoComplete="country-name"
            defaultValue="ar"
            options={[
              { value: 'ar', label: 'Argentina' },
              { value: 'br', label: 'Brazil', disabled: true },
              { value: 'us', label: 'United States' },
            ]}
          />
        </Field>
        <Field label="Region" error="Pick a region.">
          <Select
            placeholder="Choose a region"
            options={[
              { value: 'na', label: 'North America' },
              { value: 'sa', label: 'South America' },
            ]}
          />
        </Field>
        <Field label="Language">
          <NativeSelect defaultValue="es">
            <option value="es">Español</option>
            <option value="en">English</option>
          </NativeSelect>
        </Field>
        <Field label="Notes" hint="Visible to your team only.">
          <Textarea />
        </Field>
        <Field label="Account ID">
          <Input readOnly defaultValue="acct_1042" />
        </Field>
        <Field label="Disabled field">
          <Input disabled defaultValue="Locked" />
        </Field>
        <div className="flex flex-col gap-2">
          <Checkbox label="Send me product updates" hint="About once a month." defaultChecked />
          <Checkbox label="Accept the terms" error="You need to accept the terms." />
          <Checkbox label="Disabled option" disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Switch label="Email notifications" checked={notify} onCheckedChange={setNotify} hint="Applies immediately." />
          <Switch label="Locked setting" checked={false} onCheckedChange={() => {}} disabled />
        </div>
        <RadioGroup
          legend="Plan"
          name="plan"
          value={plan}
          onValueChange={setPlan}
          required
          options={[
            { value: 'solo', label: 'Solo' },
            { value: 'team', label: 'Team' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
        <SegmentedControl
          label="View"
          name="view"
          value={view}
          onValueChange={setView}
          segments={[
            { value: 'list', label: 'List', icon: <List aria-hidden="true" /> },
            { value: 'grid', label: 'Grid', icon: <LayoutGrid aria-hidden="true" /> },
            { value: 'board', label: 'Board' },
          ]}
        />
      </div>
    </section>
  );
}

function Playground() {
  useDocumentTitle('Playground', 'lumux');
  return (
    <AppShell
      header={
        <>
          <span className="text-subheading">lumux</span>
          <ThemeSwitcher themes={THEME_NAMES} className="ml-auto" />
        </>
      }
    >
      <div data-density={dense ? 'dense' : undefined} className="mx-auto flex max-w-5xl flex-col gap-6 p-4">
        <h1 className="text-title">Playground</h1>
        <Forms />
        <Overlays />
        <Content />
        {VARIANTS.map((v) => (
          <Section key={v} id={`button-${v}`} title={`Button · ${v}`}>
            <Button variant={v}>Save</Button>
            <Button variant={v} icon={<Save aria-hidden="true" />}>
              Save
            </Button>
            <Button variant={v} size="lg">
              Large
            </Button>
            <Button variant={v} loading>
              Saving
            </Button>
            <Button variant={v} icon={<Save aria-hidden="true" />} loading>
              Saving
            </Button>
            <Button variant={v} disabled disabledReason="Fill in the name first">
              Disabled
            </Button>
          </Section>
        ))}
        <Section id="icon-button" title="IconButton">
          <IconButton icon={<Settings aria-hidden="true" />} aria-label="Settings" />
          <IconButton icon={<Plus aria-hidden="true" />} aria-label="Add" variant="primary" />
          <IconButton icon={<Trash2 aria-hidden="true" />} aria-label="Delete" variant="danger" size="lg" />
          <IconButton icon={<Plus aria-hidden="true" />} aria-label="Add (disabled)" disabled disabledReason="No permission" />
        </Section>
        <Section id="link-button" title="LinkButton">
          <LinkButton href="#main" trailingIcon={<ArrowRight aria-hidden="true" />}>
            Continue
          </LinkButton>
          <LinkButton href="https://example.com" variant="link" trailingIcon={<ExternalLink aria-hidden="true" />}>
            Docs
          </LinkButton>
        </Section>
        <Section id="click-target" title="Behaviour">
          <Button data-testid="width-idle">Publish</Button>
          <Button data-testid="width-busy" loading>
            Publish
          </Button>
          <Button data-testid="width-idle-trailing" trailingIcon={<ArrowRight aria-hidden="true" />}>
            Next
          </Button>
          <Button data-testid="width-busy-trailing" trailingIcon={<ArrowRight aria-hidden="true" />} loading>
            Next
          </Button>
          <Button data-testid="counter" onClick={(e) => (e.currentTarget.dataset.clicks = String(Number(e.currentTarget.dataset.clicks ?? 0) + 1))}>
            Count
          </Button>
          <Button
            data-testid="disabled-counter"
            disabled
            disabledReason="Locked"
            onClick={(e) => (e.currentTarget.dataset.clicks = String(Number(e.currentTarget.dataset.clicks ?? 0) + 1))}
          >
            Locked
          </Button>
        </Section>
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <IconProvider>
        <TooltipProvider>
          <ToastProvider>
            <Playground />
          </ToastProvider>
        </TooltipProvider>
      </IconProvider>
    </ThemeProvider>
  </StrictMode>,
);
