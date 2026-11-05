import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About · LeanAI",
  description: "How LeanAI was built: data collection, LLM-assisted labelling, model iteration and deployment.",
};

const ITERATIONS = [
  { step: "Baseline", detail: "ResNet-50, RMSE loss, basic augmentation, 20 epochs", result: "RMSE 9.9" },
  { step: "Loss functions", detail: "Compared RMSE, root mean cubed error, Huber and Smooth L1 against MSE", result: "MSE kept" },
  { step: "Pose-based cropping", detail: "MediaPipe shoulder/hip landmarks crop every photo to the torso", result: "MAE < 3" },
  { step: "Ensemble", detail: "11 architectures combined with per-model weights", result: "Deployed model" },
];

const MODELS = [
  "resnet50", "resnet50d", "resnet34", "densenet121", "efficientnet_b3", "efficientnet_b0",
  "regnety_040", "mobilenetv3_large_100", "ghostnet_100", "maxvit_tiny_rw_224", "efficientformerv2_s0",
];

const TIMELINE = [
  { date: "2025", title: "fast.ai Practical Deep Learning", body: "Worked through the course notebooks: image classifiers, neural nets from scratch, random forests." },
  { date: "Jun 2, 2025", title: "duck_or_desert", body: "First end-to-end model: a ResNet-18 image classifier on scraped images with basic augmentation." },
  { date: "Jun 2025", title: "LeanAI", body: "This project. My own dataset, a regression task instead of classification, and a deployed ensemble.", current: true },
  { date: "Jun 17, 2025", title: "lora-from-scratch", body: "Implemented the LoRA paper on top of a pre-trained Hugging Face language model." },
  { date: "Jun–Jul 2025", title: "llm-from-scratch", body: "A transformer language model written in pure NumPy, with hand-written backpropagation and LoRA." },
];

export default function About() {
  return (
    <main className="min-h-screen px-4 py-12 sm:py-20">
      <article className="mx-auto w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-200">
          <ArrowLeft className="h-4 w-4" /> Back to the estimator
        </Link>

        <header className="mt-8">
          <p className="text-sm text-zinc-500">About</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50">LeanAI</h1>
          <p className="mt-4 leading-relaxed text-zinc-400">
            I&apos;m a Computing and Mathematics (COMA) student at Queen&apos;s University, minoring in statistics and philosophy. LeanAI was my first machine learning project built end to end: I collected the dataset, labelled it,
            trained and compared models, and deployed the result as the web app you just used.
          </p>
        </header>

        <Section title="Why I built it">
          <p>
            I&apos;ve lifted for a long time, and body fat percentage is the number that decides whether you should be building
            muscle or losing fat. I used to post progress photos to r/guessmybf for estimates. When I started learning deep learning,
            automating that judgement from a single photo seemed like a good first real problem: my own data, a regression target,
            and a result people could actually use.
          </p>
        </Section>

        <Section title="Getting data">
          <p>
            My first plan was to train on photos paired with medical-grade measurements such as DEXA or MRI scans. There isn&apos;t
            enough public data like that to train on, so I changed the goal: learn to reproduce the consensus estimate of experienced
            fitness communities instead.
          </p>
          <p>
            I wrote an asynchronous scraper with PRAW (the Python Reddit API Wrapper) to collect posts and comment threads from
            r/guessmybf and r/bulkorcut, giving about 800 posts and roughly 1,600 labelled photos. I split these into 1,264 training
            and 316 validation images. All usernames and identifying information were removed. The data was used only for this
            non-commercial project and was never redistributed.
          </p>
        </Section>

        <Section title="Labelling with an LLM">
          <p>
            Reddit comments are noisy. Jokes and sarcasm made simple number extraction unreliable, so I used the OpenAI API as a
            filter. Each post&apos;s comments went through one prompt that returned only the serious estimates as a parseable list.
            The mean of those estimates became the training label.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-zinc-900/60 p-4 font-mono text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
{`You extract body fat % predictions from a Python array of Reddit comments.
Return an array of the predictions in integer form. Ignore arbitrary numbers.
If the user gives a range (like 12-15%), return the mean.
Output only a valid Python list of integers, like [12, 18, 22].`}
          </pre>
        </Section>

        <Section title="Training and iterating">
          <p>
            I used fastai on top of PyTorch so I could prototype quickly. The table below shows the main iterations. The biggest
            improvement came from fixing the data, not from changing the model. Some photos showed a full body in a large room and
            others were tight torso shots, so I used MediaPipe pose landmarks to crop every image to the region between the
            shoulders and hips.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs text-zinc-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Step</th>
                  <th className="px-4 py-2.5 font-medium">What changed</th>
                  <th className="px-4 py-2.5 text-right font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {ITERATIONS.map((it) => (
                  <tr key={it.step}>
                    <td className="px-4 py-3 align-top font-medium text-zinc-200">{it.step}</td>
                    <td className="px-4 py-3 align-top text-zinc-400">{it.detail}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right align-top font-mono text-zinc-200">{it.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            I chose MSE partly because it gave the best results and partly because I could reason about it directly: its square
            root is the typical size of a prediction error in percentage points. That gave me a concrete target of about 2 points of
            average error.
          </p>
        </Section>

        <Section title="The ensemble">
          <p>
            Each architecture made different mistakes, so the final model combines eleven of them. I trained them with varying
            augmentation pipelines, combined their predictions with per-model weights, and exported the whole ensemble as one
            TorchScript graph so the server doesn&apos;t need fastai at runtime.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {MODELS.map((m) => (
              <span key={m} className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 font-mono text-xs text-zinc-400">{m}</span>
            ))}
          </div>
        </Section>

        <Section title="Deployment">
          <p>
            The model is served by a small FastAPI app in a Docker container on Hugging Face Spaces. It decodes the uploaded image,
            resizes it to 224×224 and runs the ensemble. This page is a Next.js and TypeScript client that sends the photo to that
            API. I also published a Gradio version of the model on Hugging Face.
          </p>
        </Section>

        <Section title="What I learned">
          <ul className="list-disc space-y-2 pl-5 marker:text-zinc-600">
            <li>Data quality set the ceiling. Cropping did more for accuracy than any architecture or loss change.</li>
            <li>When ideal data doesn&apos;t exist, reframing the problem can make it solvable, as long as you&apos;re honest about what the labels mean.</li>
            <li>LLMs are useful as a tool inside a data pipeline, not just as a product.</li>
            <li>Ensembling and careful validation splits give steadier predictions than chasing a single best model.</li>
            <li>A model isn&apos;t finished until someone else can use it: exporting, containerizing and serving were their own engineering problems.</li>
          </ul>
        </Section>

        <Section title="Limitations">
          <p>
            The labels are community estimates, not scans, so the model learns Reddit&apos;s judgement along with its biases. The
            source communities are mostly male, and lighting, posture and camera angle all move the estimate. Treat the result as an
            estimate, not a measurement.
          </p>
        </Section>

        <Section title="Where it fits">
          <ol className="mt-2 space-y-0">
            {TIMELINE.map((t, i) => (
              <li key={t.title} className="relative pb-6 pl-6 last:pb-0">
                {i < TIMELINE.length - 1 && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
                <span className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 ${t.current ? "border-zinc-100 bg-zinc-100" : "border-zinc-600 bg-zinc-950"}`} />
                <p className="font-mono text-xs text-zinc-500">{t.date}</p>
                <p className={`mt-0.5 font-medium ${t.current ? "text-zinc-50" : "text-zinc-300"}`}>{t.title}</p>
                <p className="mt-0.5 text-sm text-zinc-400">{t.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <footer className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.08] pt-6 text-sm text-zinc-500">
          <a href="https://github.com/kalandjl/LeanAI" className="transition hover:text-zinc-200">Source on GitHub</a>
          <a href="https://github.com/kalandjl/LeanAI/blob/main/blog.md" className="transition hover:text-zinc-200">Full write-up</a>
          <a href="https://huggingface.co/spaces/kalandjl/leanai-gradio" className="transition hover:text-zinc-200">Hugging Face</a>
        </footer>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
      <div className="mt-3 space-y-4 leading-relaxed text-zinc-400 [&>p]:text-[15px]">{children}</div>
    </section>
  );
}
