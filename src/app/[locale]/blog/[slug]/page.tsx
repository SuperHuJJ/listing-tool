'use client'

import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const articleContent: Record<string, Record<string, { title: string; date: string; content: string; tags: string[] }>> = {
  // 第一篇文章
  'jungle-scout-alternative': {
    zh: {
      title: 'Jungle Scout年费太高，有没有按次付费的平替？',
      date: '2026-07-12',
      tags: ['亚马逊运营', 'AI工具', 'Listing优化'],
      content: `做亚马逊快三年了，从一个人单干到现在的小团队，踩过的坑不少。今天想聊聊关于工具开销这件事。

我的工具支出变化

刚入行那会儿，跟风买了Jungle Scout。当时觉得，行业标配嘛，肯定得买。基础版每月49美元，折合人民币350多块。一年下来4000多。

但说实话，我一个月也就上3-5个新品。真正用到JS来优化Listing的时间，加起来可能不超过两小时。其余时间，这个几百块月费的软件就在角落里"吃灰"。每次续费的时候我都在想：有没有按次付费的工具？我用多少付多少，不用的时候不花钱？

我找到的解决方案

后来在卖家群里看到有人在讨论按次付费的AI Listing工具，就抱着试试看的心态用了一下（网站是ai-listing.cn，感兴趣的可以自己去搜）。

用了两周，说说我的真实感受。

先说优点：

1. 成本确实降下来了：我以前一个月JS的费用是350块，现在用这个工具，买了个129块的套餐，200次生成额度。我一个月上5个新品的话，每个产品生成一次Listing，一个月只花3块多。129块的套餐够我用三年。

2. Listing生成质量比我预期的好：一开始我对AI写Listing是持怀疑态度的，但实际用下来，标题和五点描述基本可以直接用，稍微改几个词就能上传。对于我这种英语不是母语的卖家来说，省去了大量组织语言的时间。

3. 关键词研究功能意外好用：本来只是冲着Listing生成去的，结果发现它的关键词研究功能也挺实用。输入核心词，自动给出一堆长尾词，还标注了竞争度。不用再去单独买关键词工具了。

4. 竞品分析帮我找到优化方向：我之前一直觉得自己的Listing写得还行，直到用它的竞品分析功能对比了BSR前10的产品。分析结果直接指出我的五点描述里缺少了客户最关心的售后保障信息，加上之后转化率确实有提升。

再说不足：

1. 没有选品功能：这个工具只解决Listing优化的问题，如果你需要选品功能，还是得用JS或者H10。它不能完全替代JS。

2. 生成结果需要微调：虽然是AI生成，但有些表达方式还是需要人工调整一下，不能100%直接复制使用。不过对于我这种英语水平来说，有个初稿改，比从头写强太多了。

JS和这个工具，我现在怎么用？

说实话，我现在两个都在用。JS我用它做选品和关键词调研（这两块确实是JS的强项），但Listing优化这块，我已经完全切换到这个按次付费的工具了。毕竟Listing优化是我最频繁的需求，省下来的年费足够我再投入产品开发了。

我给不同卖家的建议：

- 如果你月上新5个以内，需求主要是Listing优化和关键词研究，按次付费工具足够用了，没必要花几百块月费。
- 如果你是新手，还在测试产品阶段，先不要买年费软件。花十几块钱试试AI生成的Listing效果，确定方向了再考虑是否需要更全面的工具。
- 如果你是店群卖家，需要大量Listing，按次付费的成本优势非常明显。

总结

做了三年亚马逊，我的体会是：工具不是越贵越好，适合自己的才是最好的。如果你的核心需求是Listing优化，不想被年费绑住，按次付费的AI工具确实值得一试。至少对我来说，一年省下三四千块的软件费，是真金白银的利润。`,
    },
    en: {
      title: 'Jungle Scout Too Expensive? Try This Pay-As-You-Go Alternative',
      date: '2026-07-12',
      tags: ['Amazon FBA', 'AI Tools', 'Listing Optimization'],
      content: `After nearly three years of selling on Amazon, I've stepped on more than my fair share of pitfalls. Today, I want to talk about tool costs.

My Tool Spending Changes

When I first started, I bought Jungle Scout like everyone else. It was the industry standard. The basic plan costs $49 per month. Over a year, that's over $600.

But honestly, I only list 3-5 new products a month. The actual time I spent using JS to optimize listings was probably less than two hours total. The rest of the time, this expensive monthly software just sat there collecting dust. Every time I renewed, I asked myself: is there a pay-as-you-go tool? One where I only pay for what I use?

The Solution I Found

Later, I saw some fellow sellers discussing a pay-per-use AI listing tool in a group, so I decided to give it a try (the site is ai-listing.cn, feel free to search for it).

After two weeks of use, here are my honest thoughts.

The Pros:

1. The cost has genuinely dropped: I used to spend $49 a month on JS. Now, I bought a $18.99 package with 200 uses. If I list 5 new products a month, each product uses one generation, costing me just pennies. The $18.99 package could last me three years.

2. The listing quality is better than I expected: I was skeptical about AI writing listings at first, but the titles and bullet points can basically be used directly, just needing a few tweaks before uploading. For a non-native English speaker like me, it saves a huge amount of time on wording.

3. The keyword research feature is surprisingly useful: I originally just wanted it for listing generation, but the keyword research is pretty solid. Enter a core keyword, and it automatically gives you a bunch of long-tail keywords with competition levels marked. No need to buy a separate keyword tool.

4. Competitor analysis helped me find optimization opportunities: I always thought my listings were decent until I used the competitor analysis to compare against BSR top 10 products. The results directly pointed out that my bullet points were missing after-sales guarantee info that customers care about most. After adding it, my conversion rate did improve.

The Cons:

1. No product research features: this tool only solves the listing optimization problem. If you need product research, you'll still need JS or H10. It can't completely replace JS.

2. Generated results need minor tweaks: although it's AI-generated, some expressions still need manual adjustment and can't be 100% copy-pasted. But for someone with my English level, having a draft to edit is way better than writing from scratch.

How I Use Both Now?

Honestly, I now use both. I use JS for product research and keyword analysis (these are genuinely JS's strengths), but for listing optimization, I've completely switched to this pay-per-use tool. After all, listing optimization is my most frequent need, and the money saved on annual fees can be reinvested into product development.

My advice for different sellers:

- If you list 5 or fewer products a month, and your main needs are listing optimization and keyword research, a pay-per-use tool is sufficient. No need to spend hundreds on monthly fees.
- If you're a beginner still testing products, don't buy annual software yet. Spend just a couple of dollars to try AI-generated listings first, and only consider more comprehensive tools once you've found your direction.
- If you're a bulk seller needing lots of listings, the cost advantage of pay-per-use is significant.

Conclusion

After three years on Amazon, my takeaway is: more expensive tools aren't always better. The right tool is the one that fits your needs. If your core need is listing optimization and you don't want to be tied down by annual fees, a pay-per-use AI tool is definitely worth trying. At least for me, saving over $600 a year in software fees is real profit.`,
    },
  },
  // 第二篇文章
  'helium10-alternative': {
    zh: {
      title: '做亚马逊这几年，我被软件年费坑了不少钱',
      date: '2026-07-16',
      tags: ['亚马逊运营', 'AI工具', 'Listing优化', 'Helium10'],
      content: `之前写JS替代工具那篇，好多卖家朋友私信我说确实被年费坑过。有个做精铺的兄弟跟我说，他去年光软件费就花了一万多，结果年底一算账，真正用上的功能没几个。

说实话，我自己也是这么过来的。

刚入行那会儿，觉得贵的就是好的。H10直接上Platinum，一个月79刀。加上JS基础版49刀，光这两项一个月就128刀，一年下来小一万块。但后来发现，我天天用的其实就那几个功能，其他花里胡哨的碰都没碰过。

后来我就琢磨，能不能把需求拆开，每个功能找对应的工具来解决，不绑在一个软件上。

选品和关键词反查这块，说实话H10的Cerebro确实好用，我暂时还留着。但Listing优化这块，我觉得完全可以独立出来。毕竟Listing优化是我最频繁的需求，每周都要上新、优化老品。

然后我就开始找专门做Listing优化的工具。要求很简单：按次付费，不强制包月，用多少买多少。

还真让我找到一个。用了一个多月了，说说实际感受。

1. AI写Listing：输入产品名和卖点，自动生成标题、五点描述和产品描述。我之前一直用H10的Listing生成功能，说实话，对于普通品类，这个工具的输出质量不比H10差。关键是，它按次收费，不用为了偶尔写几条Listing去养一个月费软件。

2. 关键词功能：这个有点意外。本来只是冲着Listing生成去的，结果它的关键词研究也挺好用。输入一个核心词，能挖出来一堆长尾词，还标了竞争度高低。虽然不是H10那种专业级别的，但对于我这种中小卖家来说，日常够用了。

3. 竞品分析：这个功能帮我找到了Listing里一直没注意到的问题。我之前觉得自己的五点写得还行，结果用竞品分析对比了一个BSR前10的产品，发现人家专门强调了售后保障，我的压根没提。加上之后，那款产品的转化率确实涨了。

4. 评分功能：有点像给Listing做体检。我定期把老品丢进去跑一下，看看哪些地方需要优化。有时候标题里关键词密度不够，有时候五点描述缺少具体的卖点数据，这些我自己看根本发现不了。

价格这块，我买的是129块200次的那种。我一个月上5个新品的话，每个产品用一次，一个月3块多。129块够我用三年。对比H10 Platinum一年小7000块，省下来的钱够我多开好几个新品了。

说实话，我现在觉得工具这事儿，真不是越贵越好。适合自己的，趁手最重要。

如果你是新手，建议别一上来就买一堆年费软件。先把免费功能用起来，确定自己的核心需求了再花钱。如果你是店群卖家，Listing需求量大的，按次付费的成本优势更明显。

反正对我来说，一年能省下大几千块的软件费，是实打实的利润。`,
    },
    en: {
      title: 'How I Saved Thousands on Amazon Software by Switching to Pay-As-You-Go',
      date: '2026-07-16',
      tags: ['Amazon FBA', 'AI Tools', 'Listing Optimization', 'Helium 10'],
      content: `After writing about JS alternatives, I got a flood of messages from sellers saying they've been burned by annual fees too. One friend doing refined listing told me he spent over ten thousand yuan on software last year, and when he calculated it at year-end, he'd barely used most of the features.

Honestly, I've been there myself.

When I first started, I thought expensive meant good. Jumped straight into H10 Platinum at $79 a month. Add JS Basic at $49, that's $128 a month just on these two—almost ten thousand yuan a year. But looking back, I only used a handful of functions daily. Most features were just sitting there, untouched.

That got me thinking: could I break down my needs and find specialized tools for each function instead of being locked into one all-in-one software?

For product research and keyword reverse lookup, I'll admit H10's Cerebro is genuinely useful, so I'm keeping that. But for listing optimization—my most frequent task, with new products weekly and old ones needing updates—I felt I could separate that out entirely.

So I started looking for tools focused solely on listing optimization. Simple requirements: pay-per-use, no forced monthly subscriptions, buy only what I need.

Found one. Been using it over a month now. Here's how it actually performs:

1. AI Listing Writing: Input product name and selling points, it generates the title, bullet points, and description. I'd been using H10's listing generator before, and honestly, for standard product categories, this tool's output is just as good. The big difference? I'm not paying a monthly fee just to write a few occasional listings.

2. Keyword Function: This was a surprise. I came just for listing generation, but the keyword research turned out to be genuinely useful. Type in a core keyword, it pulls up a bunch of long-tail terms with competition levels. Not as powerful as H10's Cerebro, but for a mid-sized seller like me, it covers daily needs.

3. Competitor Analysis: This actually found problems in my listings I'd never noticed. I thought my bullet points were decent until I ran a competitor comparison against a BSR top 10 product. Turns out they were specifically emphasizing after-sales support—something completely missing from mine. After adding that, my conversion rate went up.

4. Scoring: It's like a health checkup for your listings. I regularly run old products through it to spot optimization gaps. Sometimes the title lacks keyword density, sometimes bullet points miss specific feature data—things I'd never catch on my own.

On pricing: I got the 129 yuan for 200 uses package. If I list 5 new products a month, using one generation each, that's just over 3 yuan monthly. That 129 yuan package could last me three years. Compare that to H10 Platinum at nearly 7000 yuan a year—the savings alone can fund several new product launches.

At this point, I genuinely believe tools don't need to be expensive to be good. What matters is finding what fits your workflow.

If you're just starting out, don't rush to buy a bunch of annual software subscriptions. Start with free features, figure out what you truly need, then spend. If you're a bulk seller with high listing volume, the pay-per-use advantage is even more obvious.

For me, saving thousands a year on software is real, tangible profit.`,
    },
  },
}

export default function BlogArticlePage() {
  const params = useParams()
  const locale = useLocale()
  const router = useRouter()
  const slug = params?.slug as string

  const article = articleContent[slug]?.[locale]

  useEffect(() => {
    if (article) {
      document.title = locale === 'zh'
        ? `${article.title} | AI Listing Tool 博客`
        : `${article.title} | AI Listing Tool Blog`
    }
  }, [article, locale])

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">{locale === 'zh' ? '文章未找到' : 'Article not found'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{article.title}</h1>
        </div>

        <div className="flex items-center gap-4 mb-8 text-sm text-slate-500">
          <span>{article.date}</span>
          <div className="flex gap-2">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="badge">{tag}</span>
            ))}
          </div>
        </div>

        <div className="card-listing bg-white shadow-sm p-8">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
            {article.content}
          </div>
        </div>

        <div className="mt-8 p-6 bg-brand-50 rounded-2xl text-center">
          <p className="text-slate-700 mb-3">
            {locale === 'zh' ? '想体验按次付费的AI Listing工具？' : 'Want to try a pay-as-you-go AI Listing tool?'}
          </p>
          <Button className="btn-primary" onClick={() => router.push('/')}>
            {locale === 'zh' ? '免费试用 AI Listing Tool' : 'Try AI Listing Tool for Free'}
          </Button>
        </div>
      </article>
    </div>
  )
}