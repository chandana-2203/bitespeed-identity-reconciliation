import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identifyRequestSchema, type IdentifyRequest } from "@shared/schema";
import { useIdentify } from "@/hooks/use-identify";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Fingerprint, Loader2, Sparkles } from "lucide-react";
import { JsonViewer } from "@/components/json-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { toast } = useToast();
  const identifyMutation = useIdentify();

  const form = useForm<IdentifyRequest>({
    resolver: zodResolver(identifyRequestSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
    },
  });

  const onSubmit = (data: IdentifyRequest) => {
    identifyMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Reconciliation Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Form level error from refinement (e.g. if both are empty)
  const rootError = form.formState.errors.root?.message || 
    (form.formState.errors as any)[""]?.message;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex flex-col relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-center relative z-10">
        
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full lg:w-[400px] flex-shrink-0 flex flex-col"
        >
          <div className="mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Identity Reconciliation
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Consolidate user profiles across multiple channels. Enter an email, a phone number, or both to resolve the primary identity.
            </p>
          </div>

          <Card className="p-6 sm:p-8 shadow-xl shadow-black/[0.02] border-border/50 bg-card/60 backdrop-blur-xl">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alice@example.com"
                    className="h-11 bg-background/50 transition-colors focus:bg-background"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    className="h-11 bg-background/50 transition-colors focus:bg-background"
                    {...form.register("phoneNumber")}
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>

              {rootError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                  {rootError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 group"
                disabled={identifyMutation.isPending}
              >
                {identifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reconciling...
                  </>
                ) : (
                  <>
                    Identify Contact
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Column: Results */}
        <div className="w-full lg:flex-1 pt-2 lg:pt-8 relative">
          <AnimatePresence mode="wait">
            {!identifyMutation.data && !identifyMutation.isPending && !identifyMutation.isError && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-border/60 bg-muted/20"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Awaiting Input</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Submit credentials to see the consolidated identity graph mapped here.
                </p>
              </motion.div>
            )}

            {identifyMutation.isPending && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-xl"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Traversing identity nodes...
                </p>
              </motion.div>
            )}

            {identifyMutation.data && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="rounded-3xl overflow-hidden shadow-2xl shadow-black/5 border border-border/60 bg-card"
              >
                <div className="flex items-center px-4 py-3 bg-muted/40 border-b border-border/50">
                  <div className="flex gap-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground font-mono">
                    Response JSON
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-green-600 uppercase tracking-wider">Success 200</span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 bg-[#fafafa] dark:bg-[#0a0a0a] overflow-x-auto">
                  <JsonViewer data={identifyMutation.data} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
}
