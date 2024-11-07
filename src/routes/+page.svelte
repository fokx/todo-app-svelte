<script>
	import { onMount } from 'svelte';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from '$app/forms';
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';
	// import { source } from 'sveltekit-sse';
	import { liveQuery } from 'dexie';
	import { gen_todo_id } from '$lib/utils.js';
	//
	// const connection = source('/custom-event', {
	// 	close({ connect }) {
	// 		console.log('reconnecting...');
	// 		connect();
	// 	}
	// });
	// const server_event_value = connection.select('message');
	// server_event_value.subscribe((value) => {
	// 	console.log('server_event_value:', value);
	// });
	// setTimeout(function run() {
	// 	connection.close();
	// }, 3000);

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	let user = $derived(data.user);
	let todoListCloud = $derived(data.cloud_posts);
	let logging_out = $state(false);
	let logging_in = $state(false);
	let newItem = $state('');
	let todoListNotDeletedLocal = $state();
	let todoListNotDeletedUncompletedCountLocal = $state();
	let todoListNotDeletedCountLocal = $state();
	let new_todo_id;

	let todoListLocal = liveQuery(() =>
			dbDexie.todos.orderBy('id').desc().toArray()
		// async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()} // where({'deleted': 'false'})
	);

	let todoListNotDeletedCloud = $derived(todoListCloud?.filter(t => !t.deleted));
	let todoListNotDeletedUncompletedCountCloud = $derived(todoListCloud?.filter(t => !t.deleted).filter(t => !t.done).length);
	let todoListNotDeletedCountCloud = $derived(todoListCloud?.filter(t => !t.deleted).length);

	let todo_s_text = $derived('TODO' + (todoListNotDeletedCountCloud > 1 ? 's' : ''));
	let count_status = $derived((
		(todoListNotDeletedCountCloud > 0 ?
			(todoListNotDeletedUncompletedCountCloud > 0 ?
				`${todoListNotDeletedUncompletedCountCloud} out of ${todoListNotDeletedCountCloud} ${todo_s_text} unfinished`
				: (todoListNotDeletedCountCloud === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCountCloud} ${todo_s_text} finished`) : '')

	));
	let todo_s_text_local = $derived('TODO' + (todoListNotDeletedCountLocal > 1 ? 's' : ''));
	let count_status_local = $derived((
		(todoListNotDeletedCountLocal > 0 ?
			(todoListNotDeletedUncompletedCountLocal > 0 ?
				`${todoListNotDeletedUncompletedCountLocal} out of ${todoListNotDeletedCountLocal} ${todo_s_text_local} unfinished`
				: (todoListNotDeletedCountLocal === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCountLocal} ${todo_s_text_local} finished`) : '')

	));

	let all_synced = $state();
	todoListLocal.subscribe((todos_local) => {
		todoListNotDeletedLocal = todos_local.filter(t => !t.deleted);
		todoListNotDeletedUncompletedCountLocal = todos_local.filter(t => !t.deleted).filter(t => !t.done).length;
		todoListNotDeletedCountLocal = todos_local.filter(t => !t.deleted).length;
		// console.log(todos_local);
		// console.log(todoListCloud);
		if (todoListCloud === null || todoListCloud === undefined ||
			todoListCloud.length === 0 || (todos_local.length !== todoListCloud.length)) {
			all_synced = false;
		} else {
			all_synced = todos_local.every((localTodo, index) => {
				const cloudTodo = todoListCloud[index];
				return (
					localTodo.id === cloudTodo.id &&
					localTodo.text === cloudTodo.text &&
					localTodo.done === cloudTodo.done &&
					localTodo.deleted === cloudTodo.deleted
				);
			});
		}
	});

	function addToListhandleKeydown(e) {
		if (e.target.form.key === 'Enter') {
			// if (user) {
			// e.target.form.requestSubmit();
			// } else {
			if (newItem) {
				addToList(e.target.form);
			}
			// }
		}
	}

	async function addToList(form) {
		new_todo_id = gen_todo_id();
		dbDexie.todos.add({
			id: new_todo_id,
			text: newItem,
			done: false,
			deleted: false,
			synced: false,
			created_at: new Date(),
			updated_at: new Date(),
		});
		// newItem = '';
		// if (user) {
		// 	// form.requestSubmit();
		// } else {
		// }
	}

	function deleteCompleted(form) {
		// if (user) {
		// form.requestSubmit();
		// } else {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			todoListNotDeletedLocal.forEach(todo => {
				if (todo.done) {
					dbDexie.todos.filter(t => t.id === todo.id).modify({ deleted: true, synced: false });
				}
			});
		}
		// }
	}

	onMount(() => {
		if (!window.indexedDB) {
			alert('This todo app is not unsupported on this browser. \nReason: Indexed DB is not supported!');
		}
	});

</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">
	<!--<p>{$server_event_value}</p>-->
	<div class="header-login">
		{#if user}
			<h2>{user.username}'s TODO List</h2>
			<!--			<form method="post" action="?/logout" use:enhance={() => {-->
			<!--			logging_out = true;-->
			<!--			return async ({ update }) => {-->
			<!--				await update();-->
			<!--				logging_out = false;-->
			<!--			};-->
			<!--		}}>-->
			<!--				<button aria-label="Sign out">Sign out</button>-->
			<!--			</form>-->
			<!--			{#if logging_out}-->
			<!--				<span class="logging-in-out">logging you out...</span>-->
			<!--			{/if}-->
		{:else}
			<h2>My TODO List</h2>
			<!--			<nav data-sveltekit-reload>-->
			<!--				<form method="post" action="?/login" use:enhance={() => {-->
			<!--			logging_in = true;-->
			<!--			return async ({ update }) => {-->
			<!--				await update();-->
			<!--			};-->
			<!--		}}>-->
			<!--					<button aria-label="Sign in">Sign in</button>-->
			<!--				</form>-->
			<!--			</nav>-->
			<!--			{#if logging_in}-->
			<!--				<span class="logging-in-out">signing you in...</span>-->
			<!--			{/if}-->
		{/if}

	</div>

<!--	<p>synced with cloud: {all_synced}</p>-->
	{#if user}
		<p>{count_status_local}</p>
	{:else}
		<p>{count_status_local}</p>
	{/if}

	<form method="post" action="?/createpost" class="input-form" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submissionc
		// `submitter` is the `HTMLElement` that caused the form to be submitted
		formData.append('id', new_todo_id);
		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'success') {
					dbDexie.todos.filter(t => t.id === new_todo_id).modify({ synced: true });
			}
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			update();
		};
	}}>
		<input bind:value={newItem} name="content" placeholder="new todo item.." type="text" required
					 onkeydown={(e) => addToListhandleKeydown(e)} />
		<button aria-label="Add" disabled={!newItem} onclick={(e) => addToList(e.target.form)}>Add</button>
	</form>

	<br />
	{#if user}
		<Todo todoList={todoListNotDeletedLocal} user={user} />
	{:else}
		<Todo todoList={todoListNotDeletedLocal} user={null} />
	{/if}

	<div class="footer-buttons">
		<button aria-label="View deleted TODOs" onclick={() => location.href='/deleted'} type="button">View deleted</button>
		<form method="post" action="?/deleteAllCompleted" use:enhance={({formData, cancel}) => {
		// if (user) {
			// if (!window.confirm('Do you really want to delete all completed TODOs?')) {
			// cancel();
			// }
			// return async ({ update }) => {
			// 	await update();
			// };
		// }
		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'success') {
								todoListNotDeletedLocal.forEach(todo => {
				if (todo.done) {
					dbDexie.todos.filter(t => t.deleted === true).modify({ synced: true });
				}
			});
			}
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			// update();
		};
		}}>
			<button aria-label="Remove all completed TODOs"
							disabled={!(todoListNotDeletedCountLocal-todoListNotDeletedUncompletedCountLocal)}
							onclick={(e) => deleteCompleted(e.target.form)}
			>Remove all completed
			</button>
		</form>
	</div>

	{#if user}
		<p>Currently, to view changes to your TODOs on <b>another</b> browser/device, you have to refresh manually.</p>
	{:else}
		<p>⚠️ Your TODOs are stored in your <a
			href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">browser</a>
			and will get <strong>lost</strong> when you clear browsing data.</p>
		<p><a href="/login/sso">Sign in</a> to store data in the cloud and get synced between browsers / devices.</p>
	{/if}

</div>


