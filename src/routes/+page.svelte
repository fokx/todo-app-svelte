<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from "$app/forms";

	/** @type {import('./$types').PageData} */
	let data = $props();
	let user = $state(data.data.user);

	let newItem = $state('');

	let todoListNotDeleted = liveQuery(() =>
			dbDexie.todos.where({ 'deleted': 'false' }).toArray()
		// async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()}
	);

	function handleKeydown(e) {
		if (newItem && e.key === 'Enter') {
			addToList();
		}
	}

	async function addToList() {
		// try {
		const id = dbDexie.todos.add({
			text: newItem,
			done: 'false',
			deleted: 'false'
		});
		newItem = '';

	}

	function deleteCompleted() {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			dbDexie.todos.where({ 'deleted': 'false' }).filter(t => t.done === 'true').modify({ deleted: 'true' });
		}
	}

	async function deleteTodo(index) {
		let should_delete = true;
		await dbDexie.todos.get({ id: index }).then(function(result) {
			if (result.done !== 'true' && !window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?')) {
				should_delete = false;
			}
		});
		if (should_delete === true) {
			dbDexie.todos.filter(t => t.id === index).modify({ deleted: 'true' });
		}
	}

	function updateDone(ev, index) {
		dbDexie.todos.update(index, { done: ev.target.checked.toString() });
	}

	async function editTodo(index) {
		// todoList.splice(index, 1);
		await dbDexie.todos.get({ id: index }).then(function(result) {
			let new_text = prompt(`Change "${result.text}" to:`, result.text);
			if (new_text !== null && new_text !== "") {
				dbDexie.todos.update(index, { text: new_text });
			}
		});
	}

	let uncompletedCount = liveQuery(
		() => dbDexie.todos.where({ 'deleted': 'false', 'done': 'false' }).count()
	);

	let todoListNotDeletedCount = liveQuery(
		() => dbDexie.todos.where({ 'deleted': 'false' }).count()
	);

	let todo_s_text = $derived('TODO' + ($todoListNotDeletedCount > 1 ? 's' : ''));
	let status = $derived((
		($todoListNotDeletedCount > 0 ?
			($uncompletedCount > 0 ?
				`${$uncompletedCount} out of ${$todoListNotDeletedCount} ${todo_s_text} unfinished`
				: ($todoListNotDeletedCount === 1 ? 'The only' : 'All') + ` ${$todoListNotDeletedCount} ${todo_s_text} finished`) : '')

	));

	onMount(() => {
		if (!window.indexedDB) {
			alert('Unsupported Browser: Indexed DB is not supported!');
		}
	});

	function doalert(checkboxElem) {
		if (checkboxElem.checked) {
			alert('hi');
		} else {
			alert('bye');
		}
	}

</script>

<style>
    @import '$lib/styles.css';
</style>

<h1>Hi, {user.username}!</h1>
<p>Your user ID is {user.id}.</p>
<p>Your github ID is {user.githubId}.</p>
<form method="post" use:enhance>
	<button>Sign out</button>
</form>


<div class="main">
	<h3>My TODO list</h3>
	<p>{status}</p>
	<input bind:value={newItem} type="text" placeholder="new todo item.." onkeydown={handleKeydown} />
	<button onclick={addToList} disabled={!newItem}>Add</button>
	<button onclick={deleteCompleted} disabled={!($todoListNotDeletedCount-$uncompletedCount)}>Remove all TODOs
		completed
	</button>
	<br />
	<ul>
		{#if $todoListNotDeleted}
			{#each $todoListNotDeleted as todo, index (todo.id)}
				<li transition:fade={{  duration: 100}}>
					<input checked={todo.done === 'true'} onclick={(ev) => updateDone(ev, todo.id)} type="checkbox" />
					<span class:checked={todo.done === 'true'}>{todo.text}</span>
					<button onclick={() => deleteTodo(todo.id)}>Remove</button>
					<button onclick={() => editTodo(todo.id)}>Edit</button>
					<br />
				</li>
			{/each}
		{/if}
	</ul>

</div>

